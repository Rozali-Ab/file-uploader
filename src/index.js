import FileUploader from "./file-uploader.js";

const app = document.querySelector('#app');

const menu = document.createElement('div');
menu.classList.add('menu');
menu.textContent = 'Загрузить файл';

menu.addEventListener('click', () => {

	if (!app.querySelector('file-uploader')) {
		const fileUploader = new FileUploader();

		app.append(fileUploader);
	}
})

app.append(menu);

