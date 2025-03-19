import { FILE_SIZE } from "./constants.js";

export default class FileUploader extends HTMLElement {
	closeButton = document.createElement('div');


	title = document.createElement('div');

	form = document.createElement('form');
	formTitle = document.createElement('span');
	fileNameInput = document.createElement('input');

	fileDropZone = document.createElement('label');
	uploadInput = document.createElement('input');

	progressBar = document.createElement('progress');
	fileNameSpan = document.createElement('span');

	uploadButton = document.createElement('button');

	errorText = document.createElement('div');

	loading = document.createElement('div');


	constructor() {
		super();

		this.attachShadow({ mode: 'open' });
		this.render();
		this.setupListeners();
	}

	render () {

		const styleSheet = document.createElement('style');
		styleSheet.textContent = this.styles;
		this.shadowRoot.appendChild(styleSheet);

		this.closeButton.classList.add('close-button');

		this.title.textContent = 'Загрузочное окно';
		this.title.classList.add('file-uploader-title');

		this.formTitle.classList.add('form-title');
		this.formTitle.textContent = 'Перед загрузкой дайте имя файлу';

		this.fileNameInput.type = 'text';
		this.fileNameInput.placeholder = 'Название файла';


		this.uploadInput.type = 'file';
		this.uploadInput.accept = '.txt,.json,.csv';
		this.uploadInput.disabled = true;
		this.uploadInput.hidden = true;

		this.fileDropZone.textContent = 'Перенесите ваш файл в область ниже';

		this.uploadButton.textContent = 'Загрузить';
		this.uploadButton.disabled = true;

		this.progressBar.value = 0;
		this.progressBar.max = 100;
		this.progressBar.hidden = true;

		this.form.append(
			this.closeButton,
			this.formTitle,
			this.fileNameInput,
			this.fileDropZone,
			this.uploadInput,
			this.errorText,
			this.progressBar,
			this.loading,
			this.uploadButton
		);

		this.shadowRoot.append(this.title, this.form);
	}

	setupListeners() {
		this.fileNameInput.addEventListener('change', this.fileNameInputHandler.bind(this));
		this.uploadInput.addEventListener('change', this.uploadInputHandler.bind(this));
		this.uploadButton.addEventListener('click', this.uploadFile.bind(this));

		this.fileDropZone.addEventListener('click', () => this.uploadInput.click());

		this.fileDropZone.addEventListener('dragover', (evt) => evt.preventDefault());


		this.fileDropZone.addEventListener('drop', (evt) => {
			evt.preventDefault();

			const file = evt.dataTransfer.files[0];

			if (file) {
				this.uploadInput.files = evt.dataTransfer.files;
				this.uploadInputHandler();
			}
		});
	}


	validateFile(file) {

		if (!file) {
			return false;
		}

		if (file.size > FILE_SIZE) {
			this.errorText.textContent = 'Превышен максимальный размер файла';

			setTimeout(() => {
				this.errorText.textContent = '';
			}, 3000);

			return false;
		}

		return true;
	}

	fileNameInputHandler() {
		this.uploadInput.disabled = false;
		this.uploadButton.disabled = true;

		this.formTitle.textContent = 'Перенесите ваш файл в область ниже';
	}

	uploadInputHandler() {

		const file = this.uploadInput.files[0];

		if (this.validateFile(file)) {
			this.uploadButton.disabled = false;

			this.fileNameSpan.textContent = `${this.fileNameInput.value.trim()}.${file.name.split('.').pop()}`;
		}
	}

	async uploadFile(evt) {
		evt.preventDefault();

		const file = this.uploadInput.files[0];
		const newFileName = this.fileNameInput.value.trim();
		const newFile = new File([file], `${newFileName}.${file.name.split('.').pop()}`, {
			type: file.type
		});

		const formData = new FormData();
		formData.append('file', newFile);
		formData.append('name', newFileName);

		// Блокируем интерфейс
		this.uploadButton.disabled = true;
		this.fileNameInput.disabled = true;
		this.uploadInput.disabled = true;


		return new Promise((resolve, reject) => {
			const req = new XMLHttpRequest();

			req.upload.addEventListener('progress', (event) => {
				const percentComplete = (event.loaded / event.total)*100;

					this.progressBar.hidden = false;

					this.progressBar.setAttribute('value', percentComplete.toString())

			});

			req.addEventListener('load', () => {
				if (req.status === 200) {
					const response = JSON.parse(req.responseText);

					//showSuccess


					this.form.reset();
					resolve(response);
				} else {
					const error = JSON.parse(req.responseText);
					reject(new Error(error.error || 'Ошибка при загрузке файла'));
				}
			});

			req.addEventListener('error', () => {
				reject(new Error('Ошибка сети при загрузке файла'));
			});

			req.addEventListener('loadend', () => {
				this.fileNameInput.disabled = false;
				this.progressBar.style.display = 'none';
				this.progressBar.setAttribute('value', '0');
			});

			const url = import.meta.env.VITE_API_URL;
			req.open('POST', url);
			req.send(formData);
		}).catch(error => {
			this.errorText.textContent = error.message;
			//showError
		});
	}

	styles = `
		
	`;
}

customElements.define('file-uploader', FileUploader);
