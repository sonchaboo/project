import React from 'react';
import './App.css';


export default class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = { file: '', imagePreviewUrl: '' };
	}

	uploadImage(imageFile) {
		return new Promise((resolve, reject) => {
			let imageFormData = new FormData();
			imageFormData.append('imageFile', imageFile);
			var xhr = new XMLHttpRequest();
			xhr.open('post', '/upload', true);
			xhr.onload = function () {
				if (this.status === 200) {
					resolve(this.response);
				} else {
					reject(this.statusText);
				}
			};
			xhr.send(imageFormData);
		});
	}

	_handleSubmit(e) {
		e.preventDefault();
		this.uploadImage(this.state.file);
		console.log('handle uploading-', this.state.file);
	}

	_handleImageChange(e) {
		e.preventDefault();

		let reader = new FileReader();
		let file = e.target.files[0];

		reader.onloadend = () => {
			this.setState({
				file: file,
				imagePreviewUrl: reader.result
			});
		}

		reader.readAsDataURL(file)
	}

	render() {
		let { imagePreviewUrl } = this.state;
		let $imagePreview = null;
		if (imagePreviewUrl) {
			$imagePreview = (<img src={imagePreviewUrl} alt="preview" />);
		} else {
			$imagePreview = (<div className="previewText">Please select an Image for Preview</div>);
		}

		return (
			<div className="previewComponent">
				<form onSubmit={(e) => this._handleSubmit(e)}>
					<input className="fileInput"
						type="file"
						onChange={(e) => this._handleImageChange(e)} />
					<button className="submitButton"
						type="submit"
						onClick={(e) => this._handleSubmit(e)}>Upload Image</button>
				</form>
				<div className="imgPreview">
					{$imagePreview}
				</div>
			</div>
		)
	}
}
