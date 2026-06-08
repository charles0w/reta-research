-- Enforce minimum code length of 8 characters at the DB level.
ALTER TABLE affiliate_codes
  ADD CONSTRAINT affiliate_codes_code_min_length
  CHECK (length(code) >= 8);
