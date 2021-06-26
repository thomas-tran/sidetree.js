# @sidetree/qldb

This package contains an implementation of the Sidetree ledger interface on the QLDB ledger. It passes the test suite defined in `@sidetree/ledger`.

Setup QLDB ledger

## Setup QLDB ledger

- Create a new QLDB ledger: https://console.aws.amazon.com/qldb/home?region=us-east-1#first-run
- Set the same name used in `qldbLedger` in your config file
- Create an IAM User named `qldb-admin` with `Programmatic access`: https://console.aws.amazon.com/iam/home?region=us-east-1#/users
- Attach `AmazonQLDBFullAccess` policy to the user
- Write down the access key and the secret key and run the following commands locally:
```bash
aws configure set region us-east-1
aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID
aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY
```

## Usage

```
npm install --save @sidetree/qldb
```

## Development

```
npm install
npm run test
```

## QLDB FIPS Compliance

FIPS compliance for QLDB is unclear at this point mainly because we cannot know how AWS's internal crypto is used.

- QLDB uses a Merkle Tree with the SHA256 hash function to build its immutable ledger capabilities, which is part of FIPS's Secure Hash Standard. See [FIPS-180-4](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf).

- [AWS Documentation on QLDB compliance](https://docs.aws.amazon.com/qldb/latest/developerguide/qldb-compliance.html)

- "[Data in transit is encrypted using TLS](https://docs.aws.amazon.com/qldb/latest/developerguide/data-protection.html)". AWS uses two implementations of TLS. 

Both have FIPS mode and non FIPS mode. 
It's not clear which is used or whether FIPS mode is on for QLDB
    - OpenSSL: The open source standard implementation
    - s2n: Amazon's own lightweight implementation

- "[Data at rest is encrypted using AWS owned keys](https://docs.aws.amazon.com/qldb/latest/developerguide/data-protection.html)"
- QLDB is not in the list of services that have a [FIPS compliant endpoints](https://aws.amazon.com/compliance/fips/?nc1=h_ls)



