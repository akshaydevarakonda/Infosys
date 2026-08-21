import axios from "axios";

const CL_URL =
    "http://localhost:9797/fincore/customer-loan";

const CL_ID_URL =
    "http://localhost:9797/fincore/customer-loan/customer-loan-id";

export const addCustomerLoan = (customerLoan) => {

    return axios.post(
        CL_URL,
        customerLoan,
        {
            withCredentials: true
        }
    );
};

export const generateCustomerLoanId = () => {

    return axios.get(
        CL_ID_URL,
        {
            withCredentials: true
        }
    );
};

export const getCustomerLoanById = (customerLoanId) => {

    return axios.get(
        `${CL_URL}/${customerLoanId}`,
        {
            withCredentials: true
        }
    );
};

export const getCustomerLoans = () => {

    return axios.get(
        CL_URL,
        {
            withCredentials: true
        }
    );
};

export const getAllCustomerLoans = () => {

    return axios.get(
        `${CL_URL}/all`,
        {
            withCredentials: true
        }
    );
};

export const getMyCustomerLoans = () => {

    return axios.get(
        `${CL_URL}/cust-loan-cust`,
        {
            withCredentials: true
        }
    );
};

export const getCustomerLoansByCustomerIdForAdmin = (
    customerId
) => {

    return axios.get(
        `${CL_URL}/cust-loan/${customerId}`,
        {
            withCredentials: true
        }
    );
};

export const deleteCustomerLoan = (
    customerLoanId
) => {

    return axios.delete(
        `${CL_URL}/${customerLoanId}`,
        {
            withCredentials: true
        }
    );
};

export const approveCustomerLoan = (
    customerLoanId
) => {

    return axios.put(
        `${CL_URL}/approve/${customerLoanId}`,
        {},
        {
            withCredentials: true
        }
    );
};

export const rejectCustomerLoan = (
    customerLoanId
) => {

    return axios.put(
        `${CL_URL}/reject/${customerLoanId}`,
        {},
        {
            withCredentials: true
        }
    );
};

export const getPendingCustomerLoans = () => {

    return axios.get(
        `${CL_URL}/pending`,
        {
            withCredentials: true
        }
    );
};

export const getAcceptedCustomerLoans = () => {

    return axios.get(
        `${CL_URL}/accepted`,
        {
            withCredentials: true
        }
    );
};

export const addLoanAmountToAccount = (
    customerLoanId
) => {

    return axios.put(
        `${CL_URL}/add-amount/${customerLoanId}`,
        {},
        {
            withCredentials: true
        }
    );
};

export const getCustomerLoansByCustomerId = (
    customerId
) => {

    return axios.get(
        `${CL_URL}/cust-loan/${customerId}`,
        {
            withCredentials: true
        }
    );
};

export const applyCustomerLoan = (
    loan
) => {

    return axios.post(
        CL_URL,
        loan,
        {
            withCredentials: true
        }
    );
};

export const createCustomerLoanFromAdmin = (
    customerLoan
) => {

    return axios.post(
        `${CL_URL}/admin`,
        customerLoan,
        {
            withCredentials: true
        }
    );
};

export const getLoansForEmiPayment = () => {

    return axios.get(
        `${CL_URL}/emi-payment`,
        {
            withCredentials: true
        }
    );
};