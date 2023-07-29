import onChange from 'on-change';

export default (initialState, elements, i18nInstance) => {
  const {
    form,
    input,
    submitButton,
    feedbackEl,
    postsContainer,
    feedsContainer,
    modal: {
      modalTitle,
      modalBody,
      modalLink,
      modalCloseBtns,
    },
  } = elements;

  const createCard = (title, ulID) => {
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
    ul.setAttribute('id', ulID);
    ul.classList.add('list-group', 'border-0', 'rounded-0');
    cardDiv.append(ul);

    return {
      card: cardDiv,
      ul,
    };
  };

  const createPostEl = ({
    title,
    description,
    feedID,
    id,
    href,
    visited,
  }, state) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

    const a = document.createElement('a');
    a.setAttribute('href', href);
    a.classList.add('fw-bold');
    a.setAttribute('data-id', feedID);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    a.textContent = title;
    if (visited) {
      a.classList.remove('fw-bold');
      a.classList.add('fw-normal', 'link-secondary');
    }
    li.append(a);

    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.textContent = i18nInstance.t('feedsBodyTexts.browseButton');
    li.append(button);

    button.addEventListener('click', () => {
      modalTitle.textContent = title;
      modalBody.textContent = description;
      modalLink.setAttribute('href', href);

      a.classList.remove('fw-bold');
      a.classList.add('fw-normal', 'link-secondary');
      state.feedsBody.posts.forEach((post) => {
        if (id === post.id) {
          const postToChange = post;
          postToChange.visited = true;
        }
      });
    });

    a.addEventListener('click', () => {
      a.classList.remove('fw-bold');
      a.classList.add('fw-normal', 'link-secondary');
      state.feedsBody.posts.forEach((post) => {
        if (id === post.id) {
          const postToChange = post;
          postToChange.visited = true;
        }
      });
    });

    modalCloseBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        modalTitle.textContent = '';
        modalBody.textContent = '';
      });
    });

    return li;
  };

  const createFeedEl = ({
    title,
    description,
  }) => {
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

  const render = (state) => {
    postsContainer.innerHTML = '';
    feedsContainer.innerHTML = '';

    const postsCardObj = createCard(i18nInstance.t('feedsBodyTexts.postsHeader'), 'posts-list');
    const feedsCardObj = createCard(i18nInstance.t('feedsBodyTexts.feedsHeader'), 'feeds-list');

    state.feedsBody.posts.forEach((postData) => {
      const postEl = createPostEl(postData, state);
      postsCardObj.ul.append(postEl);
    });

    state.feedsBody.feeds.forEach((feedData) => {
      const feedEl = createFeedEl(feedData);
      feedsCardObj.ul.append(feedEl);
    });

    postsContainer.append(postsCardObj.card);
    feedsContainer.append(feedsCardObj.card);
  };

  const state = onChange(initialState, (path, curVal, prevVal) => {
    switch (path) {
      case 'form.urlState':
        if (curVal === 'valid') {
          input.classList.remove('is-invalid');
          form.reset();
          input.focus();
          render(state);
        } else if (curVal === 'invalid') {
          input.classList.add('is-invalid');
        }
        break;

      case 'form.submitButtonDisabled':
        submitButton.disabled = curVal;
        break;

      case 'feedback.feedbackText':
        feedbackEl.textContent = state.feedback.feedbackText;
        input.focus();
        break;

      case 'feedback.feedbackColor':
        feedbackEl.classList.remove(`text-${prevVal}`);
        feedbackEl.classList.add(`text-${curVal}`);
        break;

      case 'updateTracking.updateTrackingState':
        if (curVal === 'fulfilled') {
          for (let i = 0; i < state.updateTracking.newPosts.length; i += 1) {
            const postsCardObj = document.querySelector('#posts-list');
            const postEl = createPostEl(state.updateTracking.newPosts.pop(), state);
            postsCardObj.prepend(postEl);
          }
        }
        break;

      default:
        break;
    }
  });

  return state;
};
