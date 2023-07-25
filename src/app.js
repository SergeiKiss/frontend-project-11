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

  yup.setLocale({
    string: {
      url: () => ({ key: 'errorsTexts.invalidUrl' }),
    },
  });

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
        state.feedbackText = i18nInstance.t('successText');
        state.urlsList.push(url);
      } else if (err === '' && isUniqBool) {
        state.urlState = 'invalid';
        state.feedbackText = i18nInstance.t('errorsTexts.notUniq');
      } else {
        state.urlState = 'invalid';
        state.feedbackText = i18nInstance.t(err.key);
      }
    });
  });
};
