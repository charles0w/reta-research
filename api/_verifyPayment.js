// On-chain payment verification via a standard Ethereum JSON-RPC endpoint.
//
// Set ETH_RPC_URL to a mainnet JSON-RPC URL (Alchemy / Infura / QuickNode / your
// own node). Without it, verification is skipped and orders are recorded as
// 'unverified' (the pre-existing behaviour, but now explicitly flagged).
//
// Because the client POSTs the order immediately after the wallet returns the
// tx hash — i.e. BEFORE the tx is mined — a freshly-submitted payment is almost
// always 'pending' here. The cron reconciler (api/cron/verify-orders.js) flips
// 'pending' -> 'verified'/'mismatch' once the tx is mined.

const RECIPIENT = (
  process.env.RECIPIENT_ADDRESS || "0x74e9af21c6060328371b3813689b472132f89cbd"
).toLowerCase();
const USDC_CONTRACT = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"; // mainnet USDC
// keccak256("Transfer(address,address,uint256)")
const TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

async function rpc(method, params) {
  const res = await fetch(process.env.ETH_RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message || "RPC error");
  return json.result;
}

const topicToAddress = (t) => "0x" + t.slice(26).toLowerCase();

// Verify that txHash is a confirmed payment of >= expectedUsd to RECIPIENT.
// Returns one of:
//   { status: 'unverified' }        - no RPC configured (cannot check)
//   { status: 'pending', detail }   - tx not mined yet / not found / no ETH price
//   { status: 'verified', detail }  - mined, correct recipient & sufficient amount
//   { status: 'mismatch', detail }  - mined but wrong recipient / reverted / underpaid
export async function verifyPayment({ txHash, paymentMethod, expectedUsd, ethUsdPrice }) {
  if (!process.env.ETH_RPC_URL) return { status: "unverified" };

  let receipt;
  try {
    receipt = await rpc("eth_getTransactionReceipt", [txHash]);
  } catch (e) {
    return { status: "pending", detail: `receipt error: ${e.message}` };
  }
  if (!receipt) return { status: "pending", detail: "not yet mined" };
  if (receipt.status && receipt.status !== "0x1") return { status: "mismatch", detail: "tx reverted" };

  if (paymentMethod === "usdc") {
    const log = (receipt.logs || []).find(
      (l) =>
        l.address &&
        l.address.toLowerCase() === USDC_CONTRACT &&
        l.topics &&
        l.topics[0] === TRANSFER_TOPIC &&
        l.topics[2] &&
        topicToAddress(l.topics[2]) === RECIPIENT
    );
    if (!log) return { status: "mismatch", detail: "no USDC transfer to recipient" };
    const paid = Number(BigInt(log.data)) / 1e6; // USDC = 6 decimals
    if (paid + 0.01 < expectedUsd) {
      return { status: "mismatch", detail: `underpaid: $${paid} < $${expectedUsd}` };
    }
    return { status: "verified", detail: `USDC $${paid}` };
  }

  // ETH payment: inspect the transaction's recipient and value.
  let tx;
  try {
    tx = await rpc("eth_getTransactionByHash", [txHash]);
  } catch (e) {
    return { status: "pending", detail: `tx error: ${e.message}` };
  }
  if (!tx) return { status: "pending", detail: "tx not found" };
  if ((tx.to || "").toLowerCase() !== RECIPIENT) return { status: "mismatch", detail: "wrong recipient" };

  const price = Number(ethUsdPrice) || 0;
  if (!price) return { status: "pending", detail: "no ETH price for valuation" };
  const eth = Number(BigInt(tx.value || "0x0")) / 1e18;
  const paidUsd = eth * price;
  // Generous tolerance: ETH/USD drifts between the client quote and on-chain
  // confirmation. Block gross underpayment (e.g. the total=0.01 exploit) while
  // not rejecting legitimate orders caught by normal rate movement.
  if (paidUsd < expectedUsd * 0.9) {
    return { status: "mismatch", detail: `underpaid: ~$${paidUsd.toFixed(2)} < $${expectedUsd}` };
  }
  return { status: "verified", detail: `ETH ${eth} ~ $${paidUsd.toFixed(2)}` };
}
