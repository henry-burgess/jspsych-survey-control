# jspsych-survey-control
_A jsPsych plugin that enables control questions to be added to behavioural experiments._

## Parameters
`question`
- **Required:** yes
- **Type**: `String`
- **Description:** The question to be presented to the participant.

`options`
- **Required:** yes
- **Type**: `Array<String>`
- **Description:** A list of responses that the participant can select as their answer to the control question.

`correct_option`
- **Required:** yes
- **Type**: `int`
- **Description:** The index of the correct response in the list of responses. Indexed from 0.

`button_text`
- **Required:** no
- **Type**: `String`
- **Description:** The text displayed on the button below the options.

`feedback_correct`
- **Required:** yes
- **Type**: `String`
- **Description:** Feedback to be given for a correct answer.

`feedback_incorrect`
- **Required:** yes
- **Type**: `String`
- **Description:** Feedback to be given for an incorrect answer.

`feedback_function`
- **Required:** no
- **Type**: `Function`
- **Description:** The function called once feedback has been given.

