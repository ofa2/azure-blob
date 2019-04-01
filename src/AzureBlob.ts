import { BlobService, createBlobService } from 'azure-storage';
import { Duplex } from 'stream';

import { defer, IDeferred } from './util';

export interface IAzureBlob {
  accountName: string;
  accountKey: string;
  endpoint: string;
  containerName: string;
}

class AzureBlob {
  private service: BlobService;

  private containerName: string;

  private endpoint: string;

  private initDeferred: IDeferred<void> | null = null;

  constructor({
    accountName, accountKey, endpoint, containerName,
  }: IAzureBlob) {
    this.containerName = containerName;
    this.endpoint = endpoint;

    this.service = createBlobService(accountName, accountKey, endpoint);
  }

  private static bufferToStream(buffer: Buffer) {
    let stream = new Duplex();
    stream.push(buffer);
    stream.push(null);
    return stream;
  }

  private async checkInit() {
    if (this.initDeferred) {
      return this.initDeferred.promise;
    }

    this.initDeferred = defer<void>();

    try {
      await this.createContainer();
      this.initDeferred.resolve();
    } catch (e) {
      this.initDeferred.reject(e);
    }

    return this.initDeferred.promise;
  }

  public async uploadBuffer(key: string, buffer: Buffer) {
    await this.checkInit();

    let stream = AzureBlob.bufferToStream(buffer);
    let streamLength = buffer.length;

    await new Promise((resolve, reject) => {
      this.service.createBlockBlobFromStream(
        this.containerName,
        key,
        stream,
        streamLength,
        {},
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });

    return this.getUrl(key);
  }

  private async createContainer() {
    return new Promise((resolve, reject) => {
      this.service.createContainerIfNotExists(
        this.containerName,
        { publicAccessLevel: 'blob' },
        (err: Error) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  private getUrl(blobName: string) {
    return `https://${this.endpoint}/${this.containerName}/${blobName}`;
  }
}

export { AzureBlob };
