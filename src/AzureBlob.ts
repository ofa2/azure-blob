import { BlobService, createBlobService } from 'azure-storage';
import { Duplex } from 'stream';

import { defer, IDeferred } from './util';

export interface IAzureBlob {
  accountName: string;
  accountKey: string;
  containerName: string;
  baseUrl: string;
  fileKeyPrefix?: string;
}

class AzureBlob {
  private service: BlobService;

  private containerName: string;

  private baseUrl: string;

  private fileKeyPrefix: string | undefined;

  private initDeferred: IDeferred<void> | null = null;

  constructor({
    accountName, accountKey, baseUrl, containerName, fileKeyPrefix,
  }: IAzureBlob) {
    this.containerName = containerName;
    this.fileKeyPrefix = fileKeyPrefix;

    this.baseUrl = baseUrl;
    let endpoint = baseUrl.replace(/^https?:\/\//, '');

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

  public async uploadBuffer(fileKey: string, buffer: Buffer) {
    await this.checkInit();

    let key = fileKey;
    if (this.fileKeyPrefix) {
      key = `${this.fileKeyPrefix}/${fileKey}`;
    }

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

  private getUrl(fileKey: string) {
    return `${this.baseUrl}/${this.containerName}/${fileKey}`;
  }
}

export { AzureBlob };
