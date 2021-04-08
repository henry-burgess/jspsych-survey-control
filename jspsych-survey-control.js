jsPsych.plugins['survey-control'] = (function() {
  const plugin = {};

  plugin.info = {
    name: 'survey-control',
    parameters: {
      question: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Question prompt text',
        default: undefined,
        description: 'The question to be presented to the participant.',
      },
      options: {
        type: jsPsych.plugins.parameterType.COMPLEX,
        pretty_name: 'List of responses in drop-down',
        default: undefined,
        description: 'A list of responses that the participant can select as ' +
          'their answer to the control question.',
      },
      correct_option: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Index of correct option',
        default: undefined,
        description: 'The index of the correct response in the list of ' +
          'responses. Indexed from 0.',
      },
      correct_feedback: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Correct feedback text',
        default: undefined,
        description: 'Feedback to be given for a correct answer.',
      },
      incorrect_feedback: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Incorrect feedback text',
        default: undefined,
        description: 'Feedback to be given for an incorrect answer.',
      },
      feedback_function: {
        type: jsPsych.plugins.parameterType.FUNCTION,
        pretty_name: 'Feedback function',
        default: function() {},
        description: 'The function called once feedback has been given.',
      },
    },
  };

  plugin.trial = function(displayElement, trial) {
    let html = '<div class="survey-control">';

    const question = trial.question;
    const options = trial.options;
    const correctOptionIndex = trial.correct_option;

    // Add the question text
    html += '<div id="control-question-container">';
    html += '<p class="control-question-text">' +
      question + '</p>';
    // Add dropdown for options
    html += '<div id="control-question-options">';
    html += '<select required name="control-options" id="control-options">';
    for (let i = 0; i < options.length; i++) {
      html += '<option value="R' + i + '">';
      html += options[i];
      html += '</option>';
    }
    html += '</select>';
    html += '</div>';
    html += '</div>';

    // Add a placeholder for feedback text
    html += '<div id="control-feedback-container">';
    html += '<div id="control-feedback">';
    html += '</div>';
    html += '</div>';

    /**
     * Handle the selection of a response
     * @param {object} _event information about the response
     */
    function selectionHandler(_event) {
      const optionText = _event.text;
      const optionIndex = _event.index;

      if (optionIndex === correctOptionIndex) {
        displayFeedback(trial.correct_feedback, 'green');
        jsPsych.finishTrial();
      } else {
        displayFeedback(trial.correct_feedback, 'red');
        jsPsych.finishTrial();
      }
    }

    /**
     * Display feedback text in div.
     * @param {*} _text feedback text to display
     * @param {*} _fontColour colour of feedback text
     */
    function displayFeedback(_text, _fontColour='black') {
      console.debug('Displaying feedback.');
    }

    // TO-DO: Add binding for when a response is selected

    // Update displayed HTML
    displayElement.inner_html = html;
  };

  return plugin;
})();
