import { AzureBlob, IAzureBlob } from './AzureBlob';

interface IConfig {
  [key: string]: any;
  azureBlob: IAzureBlob;
}

async function lift(this: { config: IConfig; azureBlob?: AzureBlob }) {
  if (!this.config.azureBlob) {
    throw new Error('no azureBlob config found');
  }

  if (
    !this.config.azureBlob.accountName
    || !this.config.azureBlob.accountKey
    || !this.config.azureBlob.baseUrl
    || !this.config.azureBlob.containerName
  ) {
    throw new Error('azureBlob config need accountName, accountKey, baseUrl, containerName');
  }

  let azureBlob = new AzureBlob(this.config.azureBlob);

  this.azureBlob = azureBlob;
}

export { lift };
export default lift;
