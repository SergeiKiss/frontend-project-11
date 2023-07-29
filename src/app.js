import * as yup from 'yup'; // eslint-disable-line
import i18next from 'i18next'; // eslint-disable-line
import axios from 'axios'; // eslint-disable-line
import view from './view.js';
import resources from './locales/index.js';

export default () => {
  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('input'),
    submitButton: document.querySelector('button[type="submit"]'),
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
    form: {
      urlState: null,
      submitButtonDisabled: false,
    },
    urlsList: [],
    feedback: {
      feedbackText: null,
      feedbackColor: null,
    },
    feedsBody: {
      lastFeedID: 0,
      lastPostID: 0,
      feeds: [],
      posts: [],
    },
    updateTracking: {
      updateTrackingState: null,
      newPosts: [],
    },
  };

  const state = view(initialState, elements, i18nInstance);

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

  const getDOMobjFromURL = (url) => axios
    .get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
    .then((response) => {
      if (response.status === 200) return response.data;
      throw new Error();
    })
    .then((data) => {
      const parser = new DOMParser();
      const parsedData = parser.parseFromString(data.contents, 'application/xml');
      return parsedData;
    });

  const updateTracking = () => {
    setTimeout(() => {
      state.updateTracking.updateTrackingState = 'processing';
      const { feeds } = state.feedsBody;
      feeds.forEach((feed) => {
        let skipNeeded = false;
        getDOMobjFromURL(feed.url).then((doc) => {
          const posts = doc.querySelectorAll('item');
          posts.forEach((post) => {
            if (skipNeeded) return;
            const postTitle = post.querySelector('title').textContent;
            let postFound = false;
            state.feedsBody.posts.forEach((p) => {
              if (postFound) return;
              if (feed.id === p.feedID && postTitle === p.title) postFound = true;
            });
            if (postFound) {
              skipNeeded = true;
            } else {
              state.feedsBody.lastPostID += 1;
              const postID = state.feedsBody.lastPostID;
              const postDescription = post.querySelector('description').textContent;
              const postLink = post.querySelector('link').textContent;
              const postData = {
                title: postTitle,
                description: postDescription,
                feedID: feed.id,
                id: postID,
                href: postLink,
                visited: false,
              };
              state.updateTracking.newPosts.push(postData);
              state.feedsBody.posts.push(postData);
            }
          });
        })
          .catch((error) => {
            if (error instanceof TypeError) {
              state.feedback.feedbackText = i18nInstance.t('feedbackTexts.errorsTexts.invallidRSS');
            } else {
              state.feedback.feedbackText = i18nInstance.t('feedbackTexts.errorsTexts.networkErr');
            }
            state.feedback.feedbackColor = 'danger';
          });
      });
      state.updateTracking.updateTrackingState = 'fulfilled';
      updateTracking();
    }, 5000);
  };

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    state.form.urlState = 'processing';
    state.form.submitButtonDisabled = true;
    state.feedback.feedbackText = '';
    const formData = new FormData(e.target);
    const url = formData.get('url').trim();

    validate(url).then(([isSuccessValidationBool, feedbackPath]) => {
      if (isSuccessValidationBool) {
        getDOMobjFromURL(url).then((doc) => {
          state.feedsBody.lastFeedID += 1;
          const feedID = state.feedsBody.lastFeedID;
          const feedTitle = doc.querySelector('title').textContent;
          const feedDescription = doc.querySelector('description').textContent;
          state.feedsBody.feeds.unshift({
            title: feedTitle,
            description: feedDescription,
            id: feedID,
            url,
          });

          const posts = doc.querySelectorAll('item');
          const postsData = [];
          posts.forEach((post) => {
            state.feedsBody.lastPostID += 1;
            const postID = state.feedsBody.lastPostID;
            const postTitle = post.querySelector('title').textContent;
            const postDescription = post.querySelector('description').textContent;
            const postLink = post.querySelector('link').textContent;
            postsData.push({
              title: postTitle,
              description: postDescription,
              feedID,
              id: postID,
              href: postLink,
              visited: false,
            });
          });
          state.feedsBody.posts = [...postsData, ...state.feedsBody.posts];

          state.form.urlState = 'valid';
          state.form.submitButtonDisabled = false;
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
            state.form.submitButtonDisabled = false;
            state.feedback.feedbackColor = 'danger';
          });
      } else {
        state.form.urlState = 'invalid';
        state.form.submitButtonDisabled = false;
        state.feedback.feedbackColor = 'danger';
        state.feedback.feedbackText = i18nInstance.t(feedbackPath);
      }
    });
  });

  updateTracking();
};
