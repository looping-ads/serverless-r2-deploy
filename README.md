# serverless-s3-deploy

Plugin for serverless to deploy files to cloudflare R2

# Installation

```
 npm install --save-dev serverless-r2-deploy
```

# Usage

Add to your serverless.yml:

```
  plugins:
    - serverless-r2-deploy

  custom:
    r2deploy:
      bucket: "r2-bucket-name"
      accountId: "r2-account-id"
      accessKeyId: "r2-access-key-id"
      secretAccessKey: "r2-secret-access-key"
      source: "source-directory-of-your-assets"
      # Note that if source is named public/assets and target is named
      # folder the assets will be uploaded to folder/assets
      target: "target-directory-on-r2"
      globs:
        - "**/*.css"
        - "**/*.gz"
        - "**/*.ico"
        - "**/*.jpg"
        - "**/*.jpeg"
        - "**/*.js"
        - "**/*.json"
        - "**/*.map"
        - "**/*.png"
        - "**/*.svg"
        - "**/*.txt"
        - "**/*.woff2"
```

Now you can upload all of these assets to your bucket by running:

```
$ sls r2deploy
```

## Content Type

The appropriate Content Type for each file will attempt to be determined using
``mime-types``. If one can't be determined, a default fallback of
'application/octet-stream' will be used.

## Auto-deploy

Assets will always be uploaded on deployment.
