export default (state, elements) => () => {
  const { form, input, feedbackEl } = elements;

  if (state.urlState === 'valid') {
    input.classList.remove('is-invalid');

    feedbackEl.classList.remove('text-danger');
    feedbackEl.classList.add('text-success');

    form.reset();
  } else {
    input.classList.remove('is-valid');
    input.classList.add('is-invalid');

    feedbackEl.classList.remove('text-success');
    feedbackEl.classList.add('text-danger');
  }

  input.focus();
  feedbackEl.textContent = state.feedbackText;
};
