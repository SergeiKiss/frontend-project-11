export default (state, elements) => (path, curVal, prevVal) => {
  const { form, input, feedbackEl } = elements;

  switch (path) {
    case 'urlState':
      if (curVal === 'valid') {
        input.classList.remove('is-invalid');
        form.reset();
      } else {
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
