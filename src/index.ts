import { AzureBlob, IAzureBlob } from './AzureBlob';

interface IConfig {
  [key: string]: any;
  azureBlob: IAzureBlob;
}

export default function lift(config: IConfig) {
  if (!config.azureBlob) {
    throw new Error('no azureBlob config found');
  }

  if (
    !config.azureBlob.accountName
    || !config.azureBlob.accountKey
    || !config.azureBlob.endpoint
    || !config.azureBlob.containerName
  ) {
    throw new Error('azureBlob config need accountName, accountKey, endpoint, containerName');
  }

  let azureBlob = new AzureBlob(config.azureBlob);

  // @ts-ignore
  this.azureBlob = azureBlob;
}

export { lift };
