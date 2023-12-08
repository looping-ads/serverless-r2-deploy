'use strict'

const glob = require('glob-all')
const fs = require('fs')
const path = require('path')
const mime = require('mime-types')
const AWS = require('aws-sdk')

class R2Deploy {
  constructor(serverless, options) {
    this.serverless = serverless

    this.commands = {
      r2deploy: {
        usage: 'Deploy assets to R2 bucket',
        lifecycleEvents: ['deploy'],
      }
    }

    this.hooks = {
      'r2deploy:deploy': this.deployR2.bind(this),
      'after:deploy:finalize': this.deployR2.bind(this)
    }
  }

  get config() {
    return Object.assign({}, {
      bucket: null,
      accountId: null,
      accessKeyId: null,
      secretAccessKey: null,
      source: null,
      target: '',
      globs: [],
      uploadConcurrency: 1000,
    }, this.serverless.service.custom.r2deploy)
  }

  async deployR2() {
    const s3 = new AWS.S3({
      endpoint: `https://${this.config.accountId}.r2.cloudflarestorage.com`,
      accessKeyId: `${this.config.accessKeyId}`,
      secretAccessKey: `${this.config.secretAccessKey}`,
      signatureVersion: 'v4',
      region: 'auto'
    })

    for (const chunk of this.getFileChunks(this.config.uploadConcurrency)) {
      await this.uploadChunk(s3, chunk)
    }
  }

  getFileChunks(size = 1000) {
    const filenames = glob.sync(this.config.globs, {
      cwd: this.config.source,
      nodir: true,
    })

    const chunks = []
    while (filenames.length > 0) {
      chunks.push(filenames.splice(0, size))
    }

    return chunks
  }

  async uploadChunk(s3, chunk) {
    const promises = chunk.map((filename) => {
      const body = fs.readFileSync(path.join(this.config.source, filename))
      const type = mime.lookup(filename) || 'application/octet-stream'

      return s3.putObject({
        Body: body,
        Bucket: this.config.bucket,
        Key: path.join(this.config.target, filename),
        ContentType: type
      }).promise()
    })

    return Promise.all(promises)
  }
}

module.exports = R2Deploy
