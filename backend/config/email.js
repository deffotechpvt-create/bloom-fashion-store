import SibApiV3Sdk from '@sendinblue/client';


const getBrevoClient = () => {
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    apiInstance.setApiKey(
        SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
        process.env.BREVO_API_KEY
    );

    return apiInstance;
};

export default getBrevoClient;
