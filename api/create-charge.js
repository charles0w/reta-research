export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { amount, description } = req.body;

  const response = await fetch("https://api.commerce.coinbase.com/charges", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CC-Api-Key": process.env.COINBASE_COMMERCE_API_KEY,
      "X-CC-Version": "2018-03-22",
    },
    body: JSON.stringify({
      name: "Ace Peptides Order",
      description,
      pricing_type: "fixed_price",
      local_price: { amount: String(Number(amount).toFixed(2)), currency: "USD" },
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    return res.status(500).json({ error: data.error?.message || "Failed to create charge" });
  }

  res.json({ url: data.data.hosted_url });
}
