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
    postsContainer: document.querySelector('.posts'),
    feedsContainer: document.querySelector('.feeds'),
    modal: {
      modalTitle: document.querySelector('.modal-title'),
      modalBody: document.querySelector('.modal-body'),
      modalLink: document.querySelector('.modal-content').querySelector('a'),
      modalCloseBtns: document.querySelector('.modal-content').querySelectorAll('button'),
    },
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
    feedsBody: {
      lastID: 0,
      feeds: [],
      posts: [],
    },
  };

  const state = onChange(initialState, view(initialState, elements));

  yup.setLocale({
    mixed: {
      notOneOf: () => 'feedbackTexts.errorsTexts.notUniq',
    },
    string: {
      url: () => 'feedbackTexts.errorsTexts.invalidUrl',
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
      .then(() => [true, 'feedbackTexts.successText'])
      .catch((e) => [false, e.message]);
  };

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    state.urlState = 'processing';
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

            state.feedsBody.lastID += 1;
            const id = state.feedsBody.lastID;
            const feedTitle = doc.querySelector('title').textContent;
            const feedDescription = doc.querySelector('description').textContent;
            state.feedsBody.feeds.unshift({
              title: feedTitle,
              description: feedDescription,
              id,
            });

            const posts = doc.querySelectorAll('item');
            const postsData = [];
            posts.forEach((post) => {
              const postTitle = post.querySelector('title').textContent;
              const postDescription = post.querySelector('description').textContent;
              const postLink = post.querySelector('link').textContent;
              postsData.push({
                title: postTitle,
                description: postDescription,
                feedID: id,
                href: postLink,
              });
            });
            state.feedsBody.posts = [...postsData, ...state.feedsBody.posts];

            state.urlState = 'valid';
            state.feedback.feedbackColor = 'success';
            state.urlsList.push(url);
            state.feedback.feedbackText = i18nInstance.t(feedbackPath);
          })
          .catch((error) => {
            if (error instanceof TypeError) {
              state.feedback.feedbackText = i18nInstance.t('feedbackTexts.errorsTexts.invallidRSS');
            } else {
              state.feedback.feedbackText = i18nInstance.t('feedbackTexts.errorsTexts.networkErr');
            }
            state.feedback.feedbackColor = 'danger';
          });
      } else {
        state.urlState = 'invalid';
        state.feedback.feedbackColor = 'danger';
        state.feedback.feedbackText = i18nInstance.t(feedbackPath);
      }
    });
  });
};
