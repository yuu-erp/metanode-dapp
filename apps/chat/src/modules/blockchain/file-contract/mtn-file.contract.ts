import { MtnContract } from '@metanodejs/mtn-contract'
import type { TransactionPayload } from '../types'
import type {
  PushFileInfosParams,
  UploadChunksParams,
  GetFileKeyFromNameParams,
  GetFilesInfoParams,
  DownloadFileParams
} from './types'
import { fileAbis } from './abis'
import { CONTRACT_ADDRESSES } from '@/config'
import { asyncPriorityQueue } from '@/modules/realtime'

export class FileContract extends MtnContract {
  constructor() {
    super({ to: CONTRACT_ADDRESSES.file })
  }

  pushFileInfo(payload: TransactionPayload<PushFileInfosParams>): Promise<string[]> {
    const { from, inputData } = payload
    console.log('fileAbis', { fileAbis, a: fileAbis.pushFileInfo })
    return this.sendTransaction({
      from,
      functionName: 'pushFileInfo',
      abiData: fileAbis.pushFileInfo,
      inputData,
      feeType: 'sc'
    })
  }

  uploadChunks(payload: TransactionPayload<UploadChunksParams>): Promise<void> {
    const { from, inputData } = payload
    return asyncPriorityQueue.add(
      () =>
        this.sendTransaction({
          from,
          functionName: 'uploadChunks',
          abiData: fileAbis.uploadChunks,
          inputData,
          feeType: 'sc',
          gas: '3' + '0'.repeat(9)
        }),
      'low'
    )
  }

  getFileKeyFromName(payload: TransactionPayload<GetFileKeyFromNameParams>): Promise<string[]> {
    const { from, inputData } = payload
    return this.sendTransaction({
      from,
      functionName: 'getFileKeyFromName',
      abiData: fileAbis.getFileKeyFromName,
      inputData,
      feeType: 'read'
    })
  }

  getFilesInfo(payload: TransactionPayload<GetFilesInfoParams>): Promise<any> {
    const { from, inputData } = payload
    return this.sendTransaction({
      from,
      functionName: 'getFilesInfo',
      abiData: fileAbis.getFilesInfo,
      inputData,
      feeType: 'read'
    })
  }

  downloadFile(payload: TransactionPayload<DownloadFileParams>): Promise<string> {
    const { from, inputData } = payload
    return this.sendTransaction({
      from,
      functionName: 'downloadFile',
      abiData: fileAbis.downloadFile,
      inputData,
      feeType: 'read',
      gas: '10000000'
    })
  }
}
