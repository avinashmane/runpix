import { ref } from 'vue'

export default function () {
	const files = ref([])

	function addFiles(newFiles) {
		let newUploadableFiles = [...newFiles].map((file) => new UploadableFile(file)).filter((file) => !fileExists(file.id))
		files.value = files.value.concat(newUploadableFiles)
	}

	function fileExists(otherId) {
		return files.value.some(({ id }) => id === otherId)
	}

	function removeFile(file) {
		const index = files.value.indexOf(file)
		// remove blob errors
		if(file.url) {
			URL.revokeObjectURL(file.url); //console.log(file.url);
		}
		if (index > -1) files.value.splice(index, 1)
	}

	return { files, addFiles, removeFile }
}

class UploadableFile {
	constructor(file) {
		this.file = file
		// this.lastModified = file.lastModified
		this.id = `${file.name}-${file.size}-${file.lastModified}-${file.type}`
		// create data url only for images
		this.url = file.type.includes("image") ? URL.createObjectURL(file) : ''
		this.status = null
		// console.debug(this.file)
	}
}