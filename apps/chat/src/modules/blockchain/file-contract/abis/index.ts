import { pushFileInfos } from './pushFileInfos.abi'
import { uploadChunksAbi } from './uploadChunks.abi'
import { getFileKeyFromNameAbi } from './getFileKeyFromName.abi'

export const fileAbis = {
  pushFileInfos,
  uploadChunks: uploadChunksAbi,
  getFileKeyFromName: getFileKeyFromNameAbi
}
