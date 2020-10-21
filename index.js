/**
 * @name nodemw-download-all-images
 * @author Dragon-Fish
 */

const bot = require('nodemw')
const { saveImage } = require('./modules/saveImage')
const { mkdirs } = require('./modules/mkdirs')

// 获取参数
const { argv } = process

var server = argv[2]
const path = argv[3] || ''

// 显示帮助信息
const helpText = 'Usage: yarn start <wgServerName> [wgScriptPath]'
// server 未设置
if (!server) {
  console.error('Missing params\n' + helpText)
  return
}
// 帮助
if (server === '-h' || server === '--help') {
  console.log(helpText)
  return
}

// 解析 server，获取可能的 protocol 设定
var protocol = 'https'
var protocolReg = new RegExp('^(https|http)://')
if (protocolReg.test(server)) {
  server = server.replace(protocolReg, (_, match) => {
    protocol = match
    return ''
  })
}

// 创建 nodemw 实例
const client = new bot({
  debug: true,
  protocol,
  server,
  path,
})

// 创建存储文件夹
const fileDir = ('./images/' + server + path + '/').replace(/\/\//g, '/')
mkdirs(fileDir, () => { })

// 主函数
function main(from = '') {

  // 获取图片信息
  client.getImages(from, (err, data) => {

    console.log('=== 开始从 ' + server + ' 下载图片 ===')

    // 缓存图片数量
    // var imgCount = data.length
    var imgCount = 3

    // 单次下载任务
    function downloadOne(index) {
      if (index < imgCount) {
        var img = data[index],
          url = img.url,
          fileName = img.name,
          filePath = fileDir + fileName
        console.log(`[${((index + 1) / imgCount * 100).toFixed(2)} %]`, `(${index + 1}/${imgCount})`, fileName)

        // 下载下一张图片
        index++
        saveImage(url, filePath, () => {
          downloadOne(index)
        })
      } else {
        // 下载完毕
        console.log('=== 图片下载完毕，请在 ' + fileDir + ' 查看 ===')
      }
    }

    // 从第一个张图片开始下载
    downloadOne(0)

    // 如果还有剩余图片，则继续下载
    if (data.continue) {
      main(data.continue.aicontinue)
    }

  })
}

// 运行
main()