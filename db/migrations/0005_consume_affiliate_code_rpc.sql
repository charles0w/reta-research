-- Atomic affiliate-code consumption using row-level lock.
-- Decrements uses_remaining and deactivates the code when it reaches 0.
-- Returns TRUE if the code was successfully consumed, FALSE if already exhausted.

CREATE OR REPLACE FUNCTION consume_affiliate_code(p_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_uses integer;
BEGIN
  SELECT uses_remaining INTO v_uses
  FROM affiliate_codes
  WHERE id = p_id AND is_active = true
  FOR UPDATE;

  IF NOT FOUND OR v_uses <= 0 THEN
    RETURN false;
  END IF;

  UPDATE affiliate_codes
  SET
    uses_remaining = v_uses - 1,
    is_active = (v_uses - 1) > 0
  WHERE id = p_id;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION consume_affiliate_code(uuid) TO service_role;
