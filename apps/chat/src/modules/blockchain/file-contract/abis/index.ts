import { pushFileInfos } from './pushFileInfos.abi'
import { uploadChunksAbi } from './uploadChunks.abi'
import { getFileKeyFromNameAbi } from './getFileKeyFromName.abi'
import { getFilesInfoAbi } from './getFilesInfo.abi'
import { downloadFileAbi } from './downloadFile.abi'

export const fileAbis = {
  pushFileInfos,
  uploadChunks: uploadChunksAbi,
  getFileKeyFromName: getFileKeyFromNameAbi,
  getFilesInfo: getFilesInfoAbi,
  downloadFile: downloadFileAbi
}
