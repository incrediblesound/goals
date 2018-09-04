const fs = require('fs')

function _bail(err){
  console.log(err)
  throw new Error()
}

const openFile = promisify(fs.open)
const writeFile = promisify(fs.writeFile)
const appendFile = promisify(fs.appendFile)
const readFile = promisify(fs.readFile)

function create(path, contents=''){
  return writeFile(path, contents).catch(_bail)
}

function append(path, data){
  return appendFile(path, data).catch(_bail)
}

function promisify(func){
  return function(...args){
    return new Promise((resolve, reject) => {
      args.push(function(err, data){
        if(err) return reject(err)
        return resolve(data)
      })
      return func.apply(null, args)
    })
  }
}

module.exports = {
  create,
  append,
  promisify,
  readFile,
  writeFile,
}
