import dayjs from 'dayjs'
import isToday from 'dayjs/plugin/isToday'
import isYesterday from 'dayjs/plugin/isYesterday'

dayjs.extend(isToday)
dayjs.extend(isYesterday)

const weekdays = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']

export function formatUpdatedAt(date: Date | string) {
  const d = dayjs(date)
  const now = dayjs()

  if (d.isToday()) {
    return d.format('HH:mm') // hôm nay → giờ:phút
  }

  if (d.isYesterday()) {
    return 'Hôm qua' // hôm qua
  }

  const diffDays = now.diff(d, 'day')
  if (diffDays < 7) {
    // trong tuần → tên ngày
    return weekdays[d.day()]
  }

  if (d.year() === now.year()) {
    // cùng năm → dd/MM
    return d.format('DD/MM')
  }

  // khác năm → dd/MM/yyyy
  return d.format('DD/MM/YYYY')
}
