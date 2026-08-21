import React, {
    useEffect,
    useState
} from "react";

import {
    useLocation,
    useNavigate
} from "react-router-dom";

import toast from "react-hot-toast";

import {
    generateCustomerLoanId
} from "../../Services/CustomerLoanService";

import {
    getAccountIdsByCustomerIdAndType
} from "../../Services/AccountService";

import "../../DisplayView.css";
import "../../FinCorePage.css";

const CustomerLoanEntry = () => {

    const navigate =
        useNavigate();

    const location =
        useLocation();

    const selectedLoan =
        location.state || {};

    const [
        customerLoanId,
        setCustomerLoanId
    ] = useState("");

    const [
        loanId,
        setLoanId
    ] = useState(
        selectedLoan.loanId || ""
    );

    const [
        loanAmount,
        setLoanAmount
    ] = useState(
        selectedLoan.loanAmount || 100000
    );

    const [
        loanTenure,
        setLoanTenure
    ] = useState(
        selectedLoan.loanTenure || 1
    );

    const interestRate = 20;

    const [
        totalTenure,
        setTotalTenure
    ] = useState(
        selectedLoan.totalTenure || 12
    );

    const [
        emiPayable,
        setEmiPayable
    ] = useState(0);

    const [
        totalInterestPayable,
        setTotalInterestPayable
    ] = useState(0);

    const [
        totalCost,
        setTotalCost
    ] = useState(0);

    const [
        accountNumbers,
        setAccountNumbers
    ] = useState([]);

    const [
        savingsAccountNumber,
        setSavingsAccountNumber
    ] = useState("");

    const [
        error,
        setError
    ] = useState("");

    useEffect(() => {

        loadCustomerLoanId();

        loadSavingsAccounts();

    }, []);

    const loadCustomerLoanId = () => {

        generateCustomerLoanId()

            .then((response) => {

                setCustomerLoanId(
                    response.data
                );

            })

            .catch((error) => {

                console.error(
                    "Customer Loan ID generation error:",
                    error
                );

                toast.error(
                    "Unable to generate Customer Loan ID"
                );

            });

    };

    const loadSavingsAccounts = () => {

        getAccountIdsByCustomerIdAndType(
            "Savings"
        )

            .then((response) => {

                setAccountNumbers(
                    response.data || []
                );

            })

            .catch((error) => {

                console.error(
                    "Savings account loading error:",
                    error
                );

                toast.error(
                    "Unable to load your savings accounts"
                );

            });

    };

    const calculateLoan = (
        amount = loanAmount,
        tenure = loanTenure
    ) => {

        const numericAmount =
            Number(amount);

        const numericTenure =
            Number(tenure);

        if (
            !numericAmount ||
            numericAmount <= 0
        ) {

            setTotalTenure(0);
            setEmiPayable(0);
            setTotalInterestPayable(0);
            setTotalCost(0);

            return;

        }

        if (
            numericAmount % 50000 !== 0
        ) {

            setError(
                "Loan Amount must be a multiple of ₹50,000"
            );

            setEmiPayable(0);
            setTotalInterestPayable(0);
            setTotalCost(0);

            return;

        }

        setError("");

        const months =
            numericTenure * 12;

        setTotalTenure(
            months
        );

        const monthlyRate =
            interestRate / 12 / 100;

        const power =
            Math.pow(
                1 + monthlyRate,
                months
            );

        const emi =
            numericAmount *
            monthlyRate *
            power /
            (power - 1);

        const totalPayment =
            emi * months;

        const totalInterest =
            totalPayment -
            numericAmount;

        setEmiPayable(
            Number(
                emi.toFixed(2)
            )
        );

        setTotalInterestPayable(
            Number(
                totalInterest.toFixed(2)
            )
        );

        setTotalCost(
            Number(
                totalPayment.toFixed(2)
            )
        );

    };

    useEffect(() => {

        calculateLoan(
            loanAmount,
            loanTenure
        );

    }, [
        loanAmount,
        loanTenure
    ]);

    const handleAmountChange = (event) => {

        const value =
            event.target.value;

        if (value === "") {

            setLoanAmount("");
            setError("");

            return;

        }

        if (
            !/^\d+$/.test(value)
        ) {

            return;

        }

        setLoanAmount(
            Number(value)
        );

        setError("");

    };

    const handleTenureChange = (event) => {

        setLoanTenure(
            Number(
                event.target.value
            )
        );

    };

    const saveLoan = (event) => {

        event.preventDefault();

        if (!loanId) {

            toast.error(
                "Loan ID is missing. Please select a loan from Loan Report."
            );

            return;

        }

        const amount =
            Number(loanAmount);

        if (
            !amount ||
            amount <= 0
        ) {

            toast.error(
                "Please enter a valid loan amount"
            );

            return;

        }

        if (
            amount % 50000 !== 0
        ) {

            toast.error(
                "Loan Amount must be a multiple of ₹50,000"
            );

            return;

        }

        if (!savingsAccountNumber) {

            toast.error(
                "Please select your savings account"
            );

            return;

        }

        const selectedAccountExists =
            accountNumbers.some(
                (value) =>
                    Number(value) ===
                    Number(savingsAccountNumber)
            );

        if (!selectedAccountExists) {

            toast.error(
                "Invalid savings account selected"
            );

            return;

        }

        const loanRequest = {

            customerLoanId:
                customerLoanId,

            loanId:
                loanId,

            loanType:
                "Personal Loan",

            loanAmount:
                amount,

            loanTenure:
                Number(loanTenure),

            totalTenure:
                Number(totalTenure),

            interestRate:
                Number(interestRate),

            emiPayable:
                Number(emiPayable),

            totalInterestPayable:
                Number(
                    totalInterestPayable
                ),

            totalCost:
                Number(totalCost),

            paidTenure:
                0,

            amountPaidTillDate:
                0.0,

            loanDate:
                new Date()
                    .toLocaleDateString(
                        "en-GB"
                    ),

            completeDate:
                "",

            status:
                "P",

            savingsAccountNumber:
                Number(
                    savingsAccountNumber
                ),

            paymentAccountNumber:
                0

        };

        console.log(
            "Loan Request:",
            loanRequest
        );

        navigate(
            "/customer-loan-request-view",
            {
                state: {
                    loanRequest:
                        loanRequest
                }
            }
        );

    };

    const resetForm = () => {

        const defaultAmount =
            selectedLoan.loanAmount ||
            100000;

        const defaultTenure =
            selectedLoan.loanTenure ||
            1;

        setLoanAmount(
            defaultAmount
        );

        setLoanTenure(
            defaultTenure
        );

        setSavingsAccountNumber("");

        setError("");

        calculateLoan(
            defaultAmount,
            defaultTenure
        );

    };

    const returnBack = () => {

        navigate(
            "/customer-menu"
        );

    };

    return (

        <div className="customer-loan-entry-page">

            <div className="customer-loan-entry-card">

                <h1 className="customer-loan-entry-title">
                    Customer Loan Request
                </h1>

                <p>
                    Enter your loan details and continue
                    to review your request.
                </p>

                <form onSubmit={saveLoan}>

                    <div className="customer-loan-field">

                        <label>
                            Customer Loan Id:
                        </label>

                        <input
                            type="text"
                            value={customerLoanId}
                            readOnly
                        />

                    </div>

                    <div className="customer-loan-field">

                        <label>
                            Loan Id:
                        </label>

                        <input
                            type="text"
                            value={loanId}
                            readOnly
                        />

                    </div>

                    <div className="customer-loan-field">

                        <label>
                            Loan Type:
                        </label>

                        <input
                            type="text"
                            value="Personal Loan"
                            readOnly
                        />

                    </div>

                    <div className="customer-loan-field">

                        <label>
                            Loan Amount:
                        </label>

                        <input
                            type="number"
                            value={loanAmount}
                            min="50000"
                            step="50000"
                            onChange={
                                handleAmountChange
                            }
                        />

                        {error && (

                            <div className="customer-loan-error">
                                ⚠ {error}
                            </div>

                        )}

                        <small>
                            Amount must be a multiple of ₹50,000
                        </small>

                    </div>

                    <div className="customer-loan-field">

                        <label>
                            Interest Rate:
                        </label>

                        <input
                            type="text"
                            value={`${interestRate}%`}
                            readOnly
                        />

                    </div>

                    <div className="customer-loan-field">

                        <label>
                            Loan Tenure:
                        </label>

                        <select
                            value={loanTenure}
                            onChange={
                                handleTenureChange
                            }
                        >

                            <option value={1}>
                                1 Year
                            </option>

                            <option value={2}>
                                2 Years
                            </option>

                            <option value={3}>
                                3 Years
                            </option>

                            <option value={5}>
                                5 Years
                            </option>

                            <option value={10}>
                                10 Years
                            </option>

                        </select>

                    </div>

                    <div className="customer-loan-field">

                        <label>
                            Total Tenure:
                        </label>

                        <input
                            type="text"
                            value={`${totalTenure} Months`}
                            readOnly
                        />

                    </div>

                    <div className="customer-loan-field">

                        <label>
                            EMI:
                        </label>

                        <input
                            type="text"
                            value={`₹${Number(
                                emiPayable
                            ).toFixed(2)}`}
                            readOnly
                        />

                    </div>

                    <div className="customer-loan-field">

                        <label>
                            Total Interest:
                        </label>

                        <input
                            type="text"
                            value={`₹${Number(
                                totalInterestPayable
                            ).toFixed(2)}`}
                            readOnly
                        />

                    </div>

                    <div className="customer-loan-field">

                        <label>
                            Total Amount:
                        </label>

                        <input
                            type="text"
                            value={`₹${Number(
                                totalCost
                            ).toFixed(2)}`}
                            readOnly
                        />

                    </div>

                    <div className="customer-loan-field">

                        <label>
                            Select Savings Account Number:
                        </label>

                        <select
                            value={
                                savingsAccountNumber
                            }
                            onChange={(e) =>
                                setSavingsAccountNumber(
                                    e.target.value
                                )
                            }
                        >

                            <option value="">
                                Select Savings Account
                            </option>

                            {accountNumbers.map(
                                (accountNumber) => (

                                    <option
                                        key={
                                            accountNumber
                                        }
                                        value={
                                            accountNumber
                                        }
                                    >
                                        {accountNumber}
                                    </option>

                                )
                            )}

                        </select>

                        {accountNumbers.length === 0 && (

                            <small className="customer-loan-error">
                                No savings accounts found
                                for the logged-in customer.
                            </small>

                        )}

                    </div>

                    <div className="customer-loan-buttons">

                        <button
                            type="submit"
                            className="loan-btn save-btn"
                        >
                            Save
                        </button>

                        <button
                            type="button"
                            className="loan-btn reset-btn"
                            onClick={
                                resetForm
                            }
                        >
                            Reset
                        </button>

                        <button
                            type="button"
                            className="loan-btn back-btn"
                            onClick={
                                returnBack
                            }
                        >
                            Return Back
                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

};

export default CustomerLoanEntry;