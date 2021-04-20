/**
 * jspsych-survey-control
 * A jsPsych plugin for asking control questions during online behavioural
 * experiments.
 *
 * Henry Burgess
 *
 */

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
      options_radio: {
        type: jsPsych.plugins.parameterType.BOOLEAN,
        pretty_name: 'Alternate display for options',
        default: false,
        description: 'Change the options to display as a series of radio ' +
          'options instead of a drop-down.',
      },
      option_correct: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Index of correct option',
        default: undefined,
        description: 'The index of the correct response in the list of ' +
          'responses. Indexed from 0.',
      },
      option_keys: {
        type: jsPsych.plugins.parameterType.COMPLEX,
        pretty_name: 'Keycodes assigned to each option',
        default: [],
        description: 'Define a key corresponding to each ' +
          'option that is presented. Ideal for alternate control schemes.',
      },
      button_text: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button text',
        default: 'Submit',
        description: 'The text displayed on the button below the options.',
      },
      button_key: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button key',
        default: '',
        description: 'Specify a keypress to click the button. ' +
          'Ideal for alternate control schemes.',
      },
      feedback_correct: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Correct feedback text',
        default: undefined,
        description: 'Feedback to be given for a correct answer.',
      },
      feedback_incorrect: {
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
      instructions: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'HTML code for optional instructions',
        default: '',
        description: 'HTML code included beneath the control questions ' +
          'to instruct the participant on how to complete the questions.',
      },
      timeout: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Timeout duration for question',
        default: 30000,
        description: 'Timeout to be enforced for completing the control ' +
          'question.',
      },
    },
  };

  plugin.trial = function(displayElement, trial) {
    let html = '<div class="survey-control">';

    const question = trial.question;
    const options = trial.options;
    const correctOptionIndex = trial.option_correct;

    let optionKeysEnabled = trial.option_keys.length > 0;
    const buttonKeyEnabled = trial.button_key !== '';

    let mainTimeout = null;
    let continueTimeout = null;

    const trialData = {
      selected_response: -1,
      correct: false,
      rt: -1,
    };

    // Inject styling
    html += '<style>';
    html += '.jspsych-survey-control-options { ' +
        'display: inline-block; padding: 6px 12px; margin: 20px; ' +
        'font-size: 14px; font-weight: 400; ' +
        'font-family: "Open Sans", "Arial", sans-serif; ' +
        'cursor: pointer; line-height: 1.4; text-align: center; ' +
        'white-space: nowrap; vertical-align: middle; ' +
        'background-image: none; border: 1px solid transparent; ' +
        'border-radius: 4px; color: #333; ' +
        'background-color: #fff; border-color: #ccc;' +
      '}';
    html += '</style>';

    // Add the question text
    html += '<div id="control-question-container">';
    html += '<p class="control-question-text">' +
      question + '</p>';

    html += '<div id="control-question-options">';
    if (trial.options_radio === false) {
      // Add dropdown for options
      html += '<select required name="control-options" id="control-options" ' +
        'class="jspsych-survey-control-options">';
      for (let i = 0; i < options.length; i++) {
        html += '<option value="R' + i + '">';
        html += options[i];
        html += '</option>';
      }
      html += '</select>';
    } else {
      // Add radio buttons for options
      html += '<form required name="control-options" id="control-options" ' +
        'class="jspsych-survey-control-options">';
      html += '<ul style="list-style-type: none; padding-left: 0pt;">';
      for (let i = 0; i < options.length; i++) {
        html += '<li><input type="radio" id="R' + i +
          '" name="option" value="R' + i + '">';
        html += options[i];
        html += '</input></li>';
      }
      html += '</ul></form>';
    }

    html += '</div>';

    // Add a placeholder for feedback text
    html += '<div id="control-feedback-container">';
    html += '<div id="control-feedback">';
    html += '</div>';
    html += '</div>';


    html += '<div id="control-question-button">';
    html += '<button type="button" id="option-selection-button" ' +
      'class="jspsych-btn">';
    html += trial.button_text;
    html += '</button>';
    html += '</div>';

    // Append the instructions if provided
    if (trial.instructions !== '') {
      html += '<br>';
      html += '<hr>';
      html += '<br>';
      html += '<div id="control-question-instructions">';
      html += trial.instructions;
      html += '</div>';
    }

    html += '</div>';

    const startTime = (new Date).getTime();

    // Update displayed HTML
    displayElement.innerHTML = html;

    // Check for any custom key information.
    if (optionKeysEnabled) {
      // Check that the number of keys equals the number of options.
      if (trial.option_keys.length !== trial.options.length) {
        console.warn(`${trial.option_keys.length} keys specified ` +
          `for ${trial.options.length} options. Keys will not be bound.`);
        optionKeysEnabled = false;
      } else {
        // Bind the keys to selecting each option
        document.addEventListener('keyup', buttonHandler);
      }
    }

    // Add timeout for completing the question
    mainTimeout = setTimeout(() => {
      // Mark the response as incorrect before waiting 5 seconds
      displayFeedback(trial.feedback_incorrect, 'red');

      // Disable the form options
      if (trial.options_radio === false) {
        document.getElementById('control-options').disabled = true;
      } else {
        for (let i = 0; i < trial.options.length; i++) {
          document.getElementById(`R${i}`).disabled = true;
        }
      }

      // Store response as incorrect
      trialData.correct = false;

      // Clear this timeout
      clearTimeout(mainTimeout);

      // Start a 5 second countdown before continuing
      continueTimeout = setTimeout(endTrial, 5000);
    }, trial.timeout);

    /**
     * Handle the pressing of a button
     * @param {object} _event information about the button press
     */
    function buttonHandler(_event) {
      // Check what kind of button has been pressed
      _event.preventDefault();
      const keyCode = _event.code;

      // Options can be selected by keys
      if (optionKeysEnabled) {
        // Check what key was pressed
        const optionPressedIndex = trial.option_keys.indexOf(keyCode);
        if (optionPressedIndex >= 0) {
          if (trial.options_radio === false) {
            if (document.getElementById('control-options').disabled === false) {
              document.getElementById('control-options').selectedIndex =
                `${optionPressedIndex}`;
            }
          } else {
            document.getElementById(`R${optionPressedIndex}`).checked = true;
          }
        }
      }

      // Button can be pressed using a key
      if (buttonKeyEnabled) {
        if (keyCode === trial.button_key) {
          // Click the button if the key is pressed
          document.getElementById('option-selection-button').click();
        }
      }
    }

    /**
     * Handle the selection of a response
     * @param {object} _event information about the response
     */
    function selectionHandler(_event) {
      const endTime = (new Date).getTime();
      const responseTime = endTime - startTime;
      trialData.rt = responseTime;

      let optionIndex;
      if (trial.options_radio === false) {
        optionIndex = document.getElementById('control-options').selectedIndex;
        trialData.selected_response = optionIndex;

        document.getElementById('control-options').disabled = true;
      } else {
        // Get the selected radio button
        for (let i = 0; i < trial.options.length; i++) {
          if (document.getElementById(`R${i}`).checked === true) {
            optionIndex = i;
          }
          document.getElementById(`R${i}`).disabled = true;
        }
      }

      if (optionIndex === correctOptionIndex) {
        displayFeedback(trial.feedback_correct, 'green');
        trialData.correct = true;
      } else {
        displayFeedback(trial.feedback_incorrect, 'red');
        trialData.correct = false;
      }
    }

    /**
     * Display feedback text in div.
     * @param {*} _text feedback text to display
     * @param {*} _fontColour colour of feedback text
     */
    function displayFeedback(_text, _fontColour='black') {
      // Insert feedback
      const feedbackContainer = document.getElementById('control-feedback');
      const feedbackParagraph = document.createElement('p');
      feedbackParagraph.textContent = _text;
      feedbackParagraph.style.color = _fontColour;
      feedbackContainer.appendChild(feedbackParagraph);

      // Clear previous event listener
      document.getElementById('option-selection-button')
          .removeEventListener('click', selectionHandler);

      // Update button text
      document.getElementById('option-selection-button').innerText = 'Continue';

      // Update binding to continue trials
      document.getElementById('option-selection-button')
          .addEventListener('click', endTrial);
    }

    /**
     * End the trial, clean up event listeners and HTML,
     * append data to jsPsych
     */
    function endTrial() {
      // Remove event listeners
      document.removeEventListener('keyup', buttonHandler);

      // Clear a timeout that may have called this function
      clearTimeout(continueTimeout);

      displayElement.innerHTML = '';
      jsPsych.finishTrial(trialData);
    }

    // Add binding for when a response is selected
    document.getElementById('option-selection-button')
        .addEventListener('click', selectionHandler);
  };

  return plugin;
})();
