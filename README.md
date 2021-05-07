# jspsych-survey-control
_A jsPsych plugin that enables control questions to be added to behavioural experiments._

## Parameters
`question`
- **Required:** yes
- **Type:** `String`
- **Description:** The question to be presented to the participant.

`options`
- **Required:** yes
- **Type:** `Array<String>`
- **Description:** A list of responses that the participant can select as their answer to the control question.

`options_radio`
- **Required:** no
- **Type:** `Boolean`
- **Description:** Change the options to display as a series of radio options instead of a drop-down.

`option_correct`
- **Required:** yes
- **Type:** `int`
- **Description:** The index of the correct response in the list of responses. Indexed from 0.

`option_keys`
- **Required:** no
- **Type:** `List<String>`
- **Description:** A list of keycodes that are allocated to selecting each of the options listed.

`button_text`
- **Required:** no
- **Type:** `String`
- **Description:** The text displayed on the button below the options.

`button_key`
- **Required:** no
- **Type:** `String`
- **Description:** A keycode that can be allocated to pressing the button if mouse input is not the only method of interaction.

`feedback_correct`
- **Required:** yes
- **Type:** `String`
- **Description:** Feedback to be given for a correct answer.

`feedback_incorrect`
- **Required:** yes
- **Type:** `String`
- **Description:** Feedback to be given for an incorrect answer.

`feedback_function`
- **Required:** no
- **Type:** `Function`
- **Description:** The function called once feedback has been given.

`instructions`
- **Required:** no
- **Type:** `String`
- **Description:** HTML code that is placed below the options and buttons. It can be used to describe any custom controls or other useful information.

`timeout`
- **Required:** no
- **Type:** `int`
- **Description:** A timeout for completing the control questions in milliseconds, default time is 30 seconds.
