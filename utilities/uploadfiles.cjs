/**
 * Creates script to rename upload the files
 */

const fs = require('fs');
const path = require('path');
// const firebase =  require('./firebase_utils');
// Example usage
const directory = "." //'E:\\We run 2024\\Pics 5';
const raceId = 'werun2024'
// const newDirectoryPath = 'E:/uploads/werun2024'//'D:\\uploads\\werun2024\\'
const waypt = 'general'
const email = 'avinashmane$gmail.com'
// copyFileWithNewName("C:\\temp\\asdas.txt",newDirectoryPath,"newname.del")
getFilesWithCreationDates(directory)
    .then(files=>
            files
              // .slice(0,2)
              .map(async (file,i)=>{
                let newFileName =                 mapFileName(file,i,waypt,email)
                console.log(`gsutil cp "${file.path}" gs://run-pix.appspot.com/uploads/werun2024/${newFileName}`,)
                // await copyFileWithNewName("C:\\temp\\asdas.txt", newDirectoryPath, newFileName)

            }));

/**
 * 
 * all code
 */

function mapFileName(file,i,waypt,email) {
    // source file :{
    //     name: '_L3A1025.jpg',
    //     path: 'D:\\We run 2024\\Pics 5\\_L3A1025.jpg',
    //     creationDate: 2024-03-17T10:45:11.530Z
    //   }

    // target: 2024-03-16T05:17:13.320Z~10~avinashmane$gmail.com~img_1.png
    waypt = waypt || 'general'
    email = email || 'avinashmane$gmail.com'
    return [file.creationDate.toISOString(),waypt,email,file.name].join('~')
}


async function copyFileWithNewName(oldFilePath, newDirectoryPath, newFileName) {
    let oldFile
    try {
    //   oldFile = await fs.promises.open(oldFilePath, 'r');
      const newFilePath = path.join(newDirectoryPath, newFileName);
  
      // Create the destination directory if it doesn't exist
    //   await fs.promises.mkdir(newDirectoryPath, { recursive: true });
  
      await fs.promises.copyFile(oldFilePath, newFilePath);
  
      console.log(`File copied successfully to ${newFilePath}`);
    } catch (error) {
      console.error('Error copying file:', error);
    } finally {
      if (oldFile) {
        await oldFile.close(); // Close the opened file
      }
    }
  }

async function getFilesWithCreationDates(directoryPath) {
  try {
    const files = await fs.promises.readdir(directoryPath);
    const filesWithDates = await Promise.all(
      files.map(async (fileName) => {
        const filePath = path.join(directoryPath, fileName);
        const stats = await fs.promises.stat(filePath);

        return {
          name: fileName,
          path: filePath,
          creationDate: new Date(stats.birthtimeMs || stats.ctimeMs),
        };
      })
    );

    return filesWithDates;
  } catch (error) {
    console.error('Error retrieving files:', error);
    throw error; // Re-throw the error for proper handling
  }
}
  