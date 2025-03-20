import { FILE_SIZE } from "./constants.js";

const docsIconUrl = '/assets/docs.png';

export default class FileUploader extends HTMLElement {

	constructor() {
		super();

		this.attachShadow({ mode: 'open' });
		this.render();

		this.form = this.shadowRoot.querySelector('.file-uploader__form');
		this.fileNameContainer = this.shadowRoot.querySelector('.file-uploader__filename');
		this.fileNameInput = this.shadowRoot.querySelector('#filename');

		this.uploadInput = this.shadowRoot.querySelector('#file-input');
		this.uploadButton = this.shadowRoot.querySelector('#upload-button');
		this.fileDropZone = this.shadowRoot.querySelector('#file-dropzone');

		this.progressBar = this.shadowRoot.querySelector('.file-uploader__progress');
		this.progressBarElement = this.shadowRoot.querySelector('.file-uploader__progress-bar');
		this.progressValue = this.shadowRoot.querySelector('.file-uploader__progress-text');

		this.fileName = this.shadowRoot.querySelector('.file-uploader__progress-filename');
		this.formTitle = this.shadowRoot.querySelector('.form-title');
		this.closeFileUploader = this.shadowRoot.querySelector('.close-button');

		this.initialStateForm();

		this.setupListeners();
	}

	render() {
		const template = document.createElement('template');
		template.innerHTML = `
			<style>
				${this.styles}
			</style>
			<div class="close-button"></div>
			<div class="file-uploader__wrapper">
				<div class="file-uploader__title">
					<div class="main-title">Загрузочное окно</div>
					<div class="form-title"></div>
				</div>

				<form class="file-uploader__form">
					<div class="file-uploader__filename">
						<input class="file-uploader__filename-input" type="text" placeholder="Название файла" id="filename">
					</div>

					<div class="file-uploader__file-dropzone" id="file-dropzone">
						<div class="dropzone-wrapper">
							<div class="dropzone-img">
							</div>
							
							<div class="dropzone-text">
								<label for="file-input">Перенесите ваш файл в область ниже</label>
								<input id="file-input" class="file-uploader__upload-input" type="file" accept=".txt,.json,.csv" hidden>
							</div>
						</div>
					</div>  
						
					<div class="file-uploader__progress">
						<div class="progress-rectangle"></div>
						<div class="progress-info">
							<div class="progress-info--wrapper">
								<div class="file-uploader__progress-filename"></div>
							<div class="file-uploader__progress-text">0%</div>
							</div>
							<div>
								<progress class="file-uploader__progress-bar" value="0" max="100"></progress>
							</div>
							</div>
						<div class="progress-close"></div>
					</div>

					<button class="file-uploader__submit-button" type="button" id="upload-button" >Загрузить</button>
				</form>
			</div>
		`;

		this.shadowRoot.appendChild(template.content.cloneNode(true));
	}

	setupListeners() {

		this.fileNameInput.addEventListener('change', this.fileNameInputHandler.bind(this));

		this.uploadInput.addEventListener('change', this.uploadInputHandler.bind(this));
		this.uploadButton.addEventListener('click', this.uploadFile.bind(this));

		this.fileDropZone.addEventListener('click', () => this.uploadInput.click());

		//Перетаскивание файла в окно загрузки
		this.fileDropZone.addEventListener('dragover', (evt) => evt.preventDefault());

		this.fileDropZone.addEventListener('drop', (evt) => {
			evt.preventDefault();

			const file = evt.dataTransfer.files[0];

			if (file) {
				this.uploadInput.files = evt.dataTransfer.files;
				this.uploadInputHandler();
			}
		});

		//Закрытие загрузочного окна, удаление из DOM
		this.closeFileUploader.addEventListener('click', () => {
			this.remove();
		})
	}

	//Исходное состояние формы, разблокирован только инпут для названия файла
	initialStateForm() {

		this.formTitle.textContent = 'Перед загрузкой дайте имя файлу';

		this.fileNameContainer.classList.remove('hidden');
		this.fileNameInput.disabled = false;

		this.uploadInput.disabled = true;
		this.uploadButton.disabled = true;

		this.progressBar.classList.add('hidden');
	}

//Показываем ошибку, если размер файла превышен, по умолчанию к загрузке разрешения ".txt,.json,.csv"
	validateFile(file) {

		if (!file) {
			return false;
		}

		if (file.size > FILE_SIZE) {
			this.showError('Превышен максимальный размер файла');
		}

		return true;
	}

	//Если имя файла введено, разрешаем выбор и загрузку файла
	fileNameInputHandler() {

		this.uploadInput.disabled = false;
		this.uploadButton.disabled = true;
		this.formTitle.textContent = 'Перенесите ваш файл в область ниже';
	}

	//Если файл выбран, отображаем его имя и прогресс бар, разрешаем отправку на сервер
	uploadInputHandler() {

		const file = this.uploadInput.files[0];

		if (this.validateFile(file)) {
			this.uploadButton.disabled = false;
			this.progressBar.classList.remove('hidden');
			this.fileNameContainer.classList.add('hidden');

			this.fileName.textContent = `${this.fileNameInput.value.trim()}.${file.name.split('.').pop()}`;
		}
	}

	//Сообщение об успешной загрузке файла
	showSuccess({message, name, filename, timestamp}) {

		const successWindow = document.createElement('div');
		successWindow.className = 'success-window';

		successWindow.innerHTML = `
				<div class="close-button"></div>
				<div>
					Файл успешно загружен
				</div>
				<br>
				<div class="success-window-info">
					name: ${name}<br>
					filename: ${filename}<br>
					timestamp: ${timestamp}<br>
					message: ${message}
				</div>
		`;

		this.shadowRoot.appendChild(successWindow);

		const closeButton = successWindow.querySelector('.close-button');

		//Закрытие окна и возвращение исходного состояния формы
		closeButton.addEventListener('click', () => {
			successWindow.remove();

			this.initialStateForm();
		})
	}

	//Сообщение об ошибке при загрузке или от сервера
	showError(message) {

		const errorWindow = document.createElement('div');
		errorWindow.className = 'error-window';

		errorWindow.innerHTML = `
				<div class="close-button"></div>
				<div>Ошибка в загрузке файла</div> 
				<br>
				<div class="error-window-info">
					${message}
				</div>
		`;

		this.shadowRoot.appendChild(errorWindow);

		const closeButton = errorWindow.querySelector('.close-button');

		//Закрытие окна и возвращение исходного состояния формы
		closeButton.addEventListener('click', () => {
			errorWindow.remove();
			this.initialStateForm();
		})
	}

	// Отправка файла на сервер
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

		//Показываем состояние загрузки в процентах
		this.progressBar.classList.remove('hidden');

		return new Promise((resolve, reject) => {
			const req = new XMLHttpRequest();

			req.upload.addEventListener('progress', (event) => {
				const percentComplete = (event.loaded / event.total) * 100;
				this.progressBarElement.value = percentComplete;
				this.progressValue.textContent = `${Math.round(percentComplete)}%`;
			});

			req.addEventListener('load', () => {
				if (req.status === 200) {
					const response = JSON.parse(req.responseText);
					this.showSuccess(response);
					this.form.reset();
					resolve(response);
				} else {
					const error = JSON.parse(req.responseText);
					this.showError(error.error || 'Ошибка при загрузке файла');
					this.form.reset();
					reject(new Error(error.error || 'Ошибка при загрузке файла'));
				}
			});

			req.addEventListener('error', () => {
				this.showError('Ошибка сети при загрузке файла');
				this.form.reset();
				reject(new Error('Ошибка сети при загрузке файла'));
			});


			const url = import.meta.env.VITE_API_URL;
			req.open('POST', url);
			req.send(formData);
		});
	}

	styles = `
	.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 34px;
  height: 34px;
  background-color: rgba(204, 204, 206, 0.28);
  border-radius: 50%;

}

.close-button::before, 
.close-button::after {
  content: '';
  position: absolute;
  top: 20%;
  left: 50%;
  width: 3px;
  height: 20px;
  border-radius: 10px;
  background-color: #fff;
  transform: translateX(-50%) rotate(45deg);
}

.close-button::after {
  transform: translateX(-50%) rotate(-45deg);
}

.file-uploader__wrapper {
  padding-top: 30px;
  width: 277px;
  height: 426px;
}

.file-uploader__title {
  color: #fff;
  text-align: center;
}

.main-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
}

.form-title {
  font-size: 14px;
  font-weight: 300;
  margin-bottom: 13px;
}

.file-uploader__form {
  display: flex;
  flex-direction: column;
}

.file-uploader__filename {
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
  height: 35px;
}

.file-uploader__filename-span {
  font-size: 14px;
  color: #fff;
}

.file-uploader__filename-input {
  padding: 6px 9px 6px 9px;
  font-size: 17.5px;
  font-weight: 500;
  border: 1px solid #a5a5a5;
  border-radius: 10px;
  outline: none;
}

.file-uploader__filename-input::placeholder {
  color: #a5a5a5;
}

.file-uploader__filename-input:focus {
  border-color: #007bff;
}

.file-uploader__file-dropzone {
  width: 277px;
  height: 257px;
  margin-bottom: 10px;
  border: 1px solid #a5a5a5;
  border-radius: 30px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.dropzone-wrapper {
  display: flex;
  width: 100%;
  margin-top: 30px;
  flex-direction: column;
  justify-content: center;
  align-items: center;

}

.dropzone-img {
  width: 180px;
  height: 126px;
  background: url('${docsIconUrl}');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  margin-bottom: 30px;
}

.dropzone-text {
  width: 180px;
  text-align: center;
  font-size: 14px;
  color: #5f5cf0;
  z-index: 10;
}

.file-uploader__file-dropzone:hover {
  background-color: #e9f5ff;
}

.file-uploader__upload-input {
  display: none;
}

.file-uploader__progress {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 35px;
  width: 100%;
  padding: 3px;
  margin-bottom: 10px;
  border: 1px solid rgba(165, 165, 165, 1);
  border-radius: 10px;
  background-color: rgba(241, 241, 241, 1);
}

.progress-rectangle {
  width: 37px;
  height: 28px;
  border-radius: 10px;
  background-color: rgba(95, 92, 240, 1);
}

.progress-info {
  display: flex;
  flex-direction: column;
  margin: 10px;
  width: 182px;
  font-size: 10px;
  color: rgba(95, 92, 240, 1);
}

.progress-info--wrapper {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.file-uploader__progress-bar {
  width: 182px;
  height: 6px;
  color: rgba(95, 92, 240, 1);
  appearance: none;
  -webkit-appearance: none;
  border: none;
  border-radius: 5px;
  background: rgba(200, 200, 200, 0.5);
  overflow: hidden;
}

progress::-webkit-progress-bar {
  background: rgba(200, 200, 200, 0.5);
  border-radius: 5px;
}

progress::-webkit-progress-value {
  background: rgba(95, 92, 240, 1);
  border-radius: 5px;
}

progress::-moz-progress-bar {
  background: rgba(95, 92, 240, 1);
  border-radius: 5px;
}
.progress-close {
  position: relative;
  width: 14.75px;
  height: 14.75px;
}

.progress-close::before,
.progress-close::after {
  content: '';
  position: absolute;
  width: 3px;
  height: 100%;
  background-color: rgba(95, 92, 240, 1);
  border-radius: 10px;
  top: 0;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
}

.progress-close::after {
  transform: translateX(-50%) rotate(-45deg);
}

.file-uploader__submit-button {
  height: 56px;
  padding: 16px;
  font-size: 20px;
  background-color: #5f5cf0;
  color: #fff;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.file-uploader__submit-button:disabled {
  background-color: rgba(187, 185, 210, 1);
}

.file-uploader__submit-button:hover {
  background-color: #0056b3;
}

.file-uploader__submit-button:disabled {
  background-color: #bbb9d2;
  cursor: not-allowed;
}


.success-window,
.error-window {
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  top: 50%;
  left: 1px;
  width: 300px;
  height: 230px;
  color: #fff;
  border-radius: 22px;
  font-size: 20px;
  font-weight: 600;
  z-index: 10;
}

.success-window {
 background: linear-gradient(180deg, #5F5CF0 0%, rgba(143, 141, 244, 1) 100%);;
}

.success-window-info,
.error-window-info {
  font-size: 14px;
  padding: 10px;
}

.error-window {
  background: linear-gradient(rgba(240, 92, 92, 1), rgba(143, 141, 244, 1));
}

.hidden {
	display: none;
}
	`;
}

customElements.define('file-uploader', FileUploader);
