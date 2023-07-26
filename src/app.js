import onChange from 'on-change'; // eslint-disable-line
import * as yup from 'yup'; // eslint-disable-line
import i18next from 'i18next'; // eslint-disable-line
import view from './view.js';
import resources from './locales/index.js';

export default () => {
  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('input'),
    feedbackEl: document.querySelector('.feedback'),
  };

  const i18nInstance = i18next.createInstance();
  i18nInstance.init({
    lng: 'ru',
    debug: false,
    resources,
  });

  const initialState = {
    urlState: 'valid',
    feedbackText: null,
    urlsList: [],
  };

  const state = onChange(initialState, view(initialState, elements));

  yup.setLocale({
    mixed: {
      notOneOf: () => 'errorsTexts.notUniq',
    },
    string: {
      url: () => 'errorsTexts.invalidUrl',
    },
  });

  const validate = (url) => {
    const schema = yup
      .string()
      .lowercase()
      .trim()
      .url()
      .notOneOf(state.urlsList);

    return schema
      .validate(url)
      .then(() => 'successText')
      .catch((e) => e.message);
  };

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const url = formData.get('url').trim();
    validate(url).then((feedbackPath) => {
      state.feedbackText = i18nInstance.t(feedbackPath);
      if (feedbackPath === 'successText') {
        state.urlState = 'valid';
        state.urlsList.push(url);
      } else {
        state.urlState = 'invalid';
      }
    });
  });
};
