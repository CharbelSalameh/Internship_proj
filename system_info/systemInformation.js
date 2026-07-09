let fs = require('fs');
const si = require('systeminformation');
const chalk = require('chalk');
const computerinfo={};
async function getAllInfo() {
  const information = {
    system: si.system,
    cpu: si.cpu,
    memory: si.mem,
    os: si.osInfo,
    graphics: si.graphics,
    disk: si.diskLayout,
    network: si.networkInterfaces
  };

  for (let name in information) {
      computerinfo[name] = await information[name]();
    }
  
  fs.writeFile("ComputerInformation.txt",
    JSON.stringify(computerinfo, null, 2),
    function(err){
        if (err){
            throw err;
        }
    
    fs.readFile("ComputerInformation.txt","utf8",function(err,data){
      console.log(chalk.yellow(data));
      if (err){
        throw err;
      }
    })
  });   
}
getAllInfo();