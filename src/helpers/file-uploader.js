import { storage } from "../../firebase/config"
import {  ref as dbRef, uploadBytes } from "firebase/storage";
import { config } from "../config"
import mapLimit from 'async/mapLimit';
const numberofParallelUploads=5

export async function uploadFile(file, props) {
	
	// track status and upload file
	file.status = 'loading'

	let timestamp = new Date(file.timestamp).toISOString()//(file.file.lastModified).toISOString()
	let uploadLoc = (file.file.type.split("/")[0]=='video') ? config.storage.viduploads : config.storage.uploads
	let uploadPath = `${uploadLoc}/${props.raceId}/${timestamp}~${props.waypoint}~${props.user}~${file.file.name}`
	debugger;

	// console.log(file.file.name);
	let response = await uploadFiletoGCS(uploadPath, file.file);
	// let response =await timeout(4000)
	// console.log(uploadPath,response)
	// change status to indicate the success of the upload request
	file.status = true;//response.ok

	return response
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function uploadFiletoGCS(uploadPath, file) {
	// Create file metadata including the content type
	/** @type {any} */
	const metadata={
		contentType: file.type,
	};

	const storageRef=dbRef(storage, uploadPath);

	// 'file' comes from the Blob or File API
	return await uploadBytes(storageRef, file, metadata)
		.then((snapshot) => {
			console.log(`Uploaded ${snapshot.ref.fullPath}`,);
			return snapshot.name
			// debugger;
		}).catch(console.error);
}



export function uploadFiles(files, props,callback) {
	debugger;
	console.log(files)
	// return Promise.all(files.map((file) => uploadFile(file, props)))
	return mapLimit(files,
		numberofParallelUploads,
		async (f) => uploadFile(f, props),
		callback)
}

export default function createUploader(props) {
	return {
		uploadFile: function (f) {
			return uploadFile(f, props)
		},
		uploadFiles: function (files,callback,) {
			return uploadFiles(files, props,callback)
		},
	}
}