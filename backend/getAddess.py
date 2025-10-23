from algosdk import account, mnemonic

# Your 25-word mnemonic
mn = "black forward hold worry equip airport result kitten yard clock punch hair stadium annual guitar flame short home region heavy hungry spend salmon absorb bone"

# Convert mnemonic to private key
private_key = mnemonic.to_private_key(mn)

# Derive address from the private key
address = account.address_from_private_key(private_key)

print("Your Algorand address is:", address)
