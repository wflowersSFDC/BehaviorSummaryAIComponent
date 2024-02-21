import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import BEHAVIOR_SUMMARY_FIELD from '@salesforce/schema/Animal__c.Behavior_Summary__c';
import BEHAVIOR_SUMMARY_LAST_UPDATED_FIELD from '@salesforce/schema/Animal__c.Behavior_Summary_Last_Updated__c';

export default class AnimalBehaviorSummary extends LightningElement {
    @api recordId;
    fieldValue = '';
    lastUpdated = '';
    isFlowRunning = false;
    isButtonDisabled = false;

    @wire(getRecord, { recordId: '$recordId', fields: [BEHAVIOR_SUMMARY_FIELD, BEHAVIOR_SUMMARY_LAST_UPDATED_FIELD] })
    wiredRecord({ error, data }) {
        if (data) {
            this.fieldValue = data.fields.Behavior_Summary__c.value.replace(/\*\*/g, '');
            this.lastUpdated = data.fields.Behavior_Summary_Last_Updated__c.value;
        } else if (error) {
            console.error(error);
        }
    }

    handleRefresh() {
        this.isFlowRunning = true;
        this.isButtonDisabled = true;
        const flow = this.template.querySelector('lightning-flow');
        if (flow) {
            const inputVariables = [
                {
                    name: 'animalId',
                    type: 'String',
                    value: this.recordId
                }
            ];
            flow.startFlow("Update_Animal_Behavior_Summary", inputVariables);
        }
    }

    handleStatusChange(event) {
        if (event.detail.status === 'FINISHED_SCREEN') {
            // Access the output variables from the flow
            const outputVariables = event.detail.outputVariables;
            const summaryVariable = outputVariables.find(variable => variable.name === 'summary');
            if (summaryVariable) {
                // Update the fieldValue with the value from the flow
                this.fieldValue = summaryVariable.value.replace(/\*\*/g, '');
                // Update the lastUpdated date/time to the current time
                this.lastUpdated = new Date();
            }
            this.isFlowRunning = false;
            this.isButtonDisabled = true;
            // Restart the animation
            this.restartAnimation();
        }
    }

    restartAnimation() {
        const element = this.template.querySelector('.fade-in');
        element.classList.remove('fade-in');
        // Force a reflow, flushing the CSS changes
        void element.offsetWidth;
        // Re-add the fade-in class to restart the animation
        element.classList.add('fade-in');
    }
}