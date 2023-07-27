import i18next from 'i18next'; // eslint-disable-line
import resources from './locales/index.js';

const i18nInstance = i18next.createInstance();
i18nInstance.init({
  lng: 'ru',
  debug: false,
  resources,
});

const createCard = (title) => {
  const cardDiv = document.createElement('div');
  cardDiv.classList.add('card', 'border-0');

  const cardBodyDiv = document.createElement('div');
  cardBodyDiv.classList.add('card-body');
  const header = document.createElement('h2');
  header.classList.add('card-title', 'h4');
  header.textContent = title;
  cardBodyDiv.append(header);
  cardDiv.append(cardBodyDiv);

  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  cardDiv.append(ul);

  return { card: cardDiv, ul };
};

const createPostEl = ({ title, feedID, href }) => {
  const li = document.createElement('li');
  li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

  const a = document.createElement('a');
  a.setAttribute('href', href);
  a.classList.add('fw-bold');
  a.setAttribute('data-id', feedID);
  a.setAttribute('target', '_blank');
  a.setAttribute('rel', 'noopener noreferrer');
  a.textContent = title;
  li.append(a);

  const button = document.createElement('button');
  button.setAttribute('type', 'button');
  button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
  button.setAttribute('data-bs-toggle', 'modal');
  button.setAttribute('data-bs-target', '#modal');
  button.textContent = i18nInstance.t('feedsBodyTexts.browseButton');
  li.append(button);

  return li;
};

const createFeedEl = ({ title, description }) => {
  const li = document.createElement('li');
  li.classList.add('list-group-item', 'border-0', 'border-end-0');

  const h3 = document.createElement('h3');
  h3.classList.add('h6', 'm-0');
  h3.textContent = title;
  li.append(h3);

  const p = document.createElement('p');
  p.classList.add('m-0', 'small', 'text-black-50');
  p.textContent = description;
  li.append(p);

  return li;
};

const render = (state, elements) => {
  const { postsContainer, feedsContainer } = elements;
  postsContainer.innerHTML = '';
  feedsContainer.innerHTML = '';

  const postsCardObj = createCard(i18nInstance.t('feedsBodyTexts.postsHeader'));
  const feedsCardObj = createCard(i18nInstance.t('feedsBodyTexts.feedsHeader'));

  state.feedsBody.posts.forEach((postData) => {
    const postEl = createPostEl(postData);
    postsCardObj.ul.append(postEl);
  });

  state.feedsBody.feeds.forEach((feedData) => {
    const feedEl = createFeedEl(feedData);
    feedsCardObj.ul.append(feedEl);
  });

  postsContainer.append(postsCardObj.card);
  feedsContainer.append(feedsCardObj.card);
};

export default (state, elements) => (path, curVal, prevVal) => {
  const { form, input, feedbackEl } = elements;

  switch (path) {
    case 'urlState':
      if (curVal === 'valid') {
        input.classList.remove('is-invalid');
        form.reset();
        render(state, elements);
      } else if (curVal === 'invalid') {
        input.classList.add('is-invalid');
      }
      break;

    case 'feedback.feedbackText':
      feedbackEl.textContent = state.feedback.feedbackText;
      break;

    case 'feedback.feedbackColor':
      feedbackEl.classList.remove(`text-${prevVal}`);
      feedbackEl.classList.add(`text-${curVal}`);
      break;

    default:
      break;
  }

  input.focus();
};
