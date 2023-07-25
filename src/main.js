import onChange from 'on-change'; // eslint-disable-line
import * as yup from 'yup'; // eslint-disable-line
import view from './view.js';

export default () => {
  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('input'),
    feedbackEl: document.querySelector('.feedback'),
  };

  const schema = yup.string().lowercase().trim().url();

  const validate = (url) => schema
    .validate(url)
    .then(() => '')
    .catch((e) => e.message);

  const initialState = {
    urlState: 'valid',
    feedbackText: null,
    urlsList: [],
  };

  const state = onChange(initialState, view(initialState, elements));

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const url = formData.get('url');
    validate(url).then((err) => {
      const isUniqBool = state.urlsList.includes(url);

      if (err === '' && !isUniqBool) {
        state.urlState = 'valid';
        state.feedbackText = 'RSS успешно загружен';
        state.urlsList.push(url);
      } else if (err === '' && isUniqBool) {
        state.urlState = 'invalid';
        state.feedbackText = 'RSS уже существует';
      } else {
        state.urlState = 'invalid';
        state.feedbackText = 'Ссылка должна быть валидным URL';
      }
    });
  });
};
