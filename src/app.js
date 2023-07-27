import onChange from 'on-change'; // eslint-disable-line
import * as yup from 'yup'; // eslint-disable-line
import i18next from 'i18next'; // eslint-disable-line
import axios from 'axios';  // eslint-disable-line
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
    urlState: null,
    feedback: {
      feedbackText: null,
      feedbackColor: null,
    },
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
      .then(() => [true, 'successText'])
      .catch((e) => [false, e.message]);
  };

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const url = formData.get('url').trim();
    validate(url).then(([isSuccessValidationBool, feedbackPath]) => {
      if (isSuccessValidationBool) {
        axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
          .then((response) => {
            if (response.status === 200) return response.data;
            throw new Error();
          })
          .then((data) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(data.contents, 'application/xml');
            const items = doc.querySelectorAll('item');
            console.log(items);
          })
          .catch(() => {
            state.feedback.feedbackText = i18nInstance.t('errorsTexts.networkErr');
            state.feedback.feedbackColor = 'danger';
          });
        // state.urlState = 'valid';
        // state.feedback.feedbackColor = 'success';
        // state.urlsList.push(url);
      } else {
        state.urlState = 'invalid';
        state.feedback.feedbackColor = 'danger';
        state.feedback.feedbackText = i18nInstance.t(feedbackPath);
      }
    });
  });
};
