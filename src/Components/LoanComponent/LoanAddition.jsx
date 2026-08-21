import React, {
    useEffect,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import toast from "react-hot-toast";

import {
    generateLoanId,
    addLoan
} from "../../Services/LoanService";

import {
    createCustomerLoanFromAdmin
} from "../../Services/CustomerLoanService";

import {
    getAccountsByType
} from "../../Services/AccountService";

import "../../DisplayView.css";
import "../../FinCorePage.css";

const LoanAddition = () => {

    const navigate =
        useNavigate();

    const [loanId, setLoanId] =
        useState("");

    const [loanAmount, setLoanAmount] =
        useState(100000);

    const [loanTenure, setLoanTenure] =
        useState(1);

    const interestRate = 20;

    const [totalTenure, setTotalTenure] =
        useState(12);

    const [emiPayable, setEmiPayable] =
        useState(0);

    const [totalInterestPayable, setTotalInterestPayable] =
        useState(0);

    const [totalCost, setTotalCost] =
        useState(0);

    const [accounts, setAccounts] =
        useState([]);

    const [accountNumber, setAccountNumber] =
        useState("");

    const [currentBalance, setCurrentBalance] =
        useState(0);

    const [loading, setLoading] =
        useState(false);

    useEffect(() => {

        generateLoan();
        loadAccounts();

    }, []);

    const generateLoan = () => {

        generateLoanId()
            .then((response) => {

                setLoanId(
                    response.data
                );

            })
            .catch((error) => {

                console.error(
                    "Loan ID generation error:",
                    error
                );

                toast.error(
                    "Unable to generate Loan ID"
                );

            });
    };

    const loadAccounts = () => {

        getAccountsByType("Savings")
            .then((response) => {

                setAccounts(
                    response.data || []
                );

            })
            .catch((error) => {

                console.error(
                    "Savings account loading error:",
                    error
                );

                toast.error(
                    "Unable to load Savings accounts"
                );

            });
    };

    const handleAccountChange = (e) => {

        const value =
            e.target.value;

        setAccountNumber(
            value
        );

        const account =
            accounts.find(
                (item) =>
                    String(
                        item.accountNumber
                    ) ===
                    String(value)
            );

        if (account) {

            setCurrentBalance(
                Number(
                    account.balance || 0
                )
            );

        } else {

            setCurrentBalance(0);

        }
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
            numericAmount <= 0 ||
            !numericTenure ||
            numericTenure <= 0
        ) {

            setTotalTenure(0);
            setEmiPayable(0);
            setTotalInterestPayable(0);
            setTotalCost(0);

            return;
        }

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

    const handleAmountChange = (e) => {

        const value =
            e.target.value;

        if (value === "") {

            setLoanAmount("");

            return;
        }

        if (!/^\d+$/.test(value)) {

            return;
        }

        setLoanAmount(
            Number(value)
        );
    };

    const handleTenureChange = (e) => {

        const tenure =
            Number(
                e.target.value
            );

        setLoanTenure(
            tenure
        );

        calculateLoan(
            loanAmount,
            tenure
        );
    };

    const saveLoan = async (e) => {

        e.preventDefault();

        const amount =
            Number(loanAmount);

        const tenure =
            Number(loanTenure);

        const months =
            Number(totalTenure);

        if (!loanId) {

            toast.error(
                "Loan ID is not available"
            );

            return;
        }

        if (!accountNumber) {

            toast.error(
                "Please select a Savings account"
            );

            return;
        }

        const selectedAccount =
            accounts.find(
                (account) =>
                    String(
                        account.accountNumber
                    ) ===
                    String(accountNumber)
            );

        if (!selectedAccount) {

            toast.error(
                "Invalid Savings account selected"
            );

            return;
        }

        const normalizedType =
            String(
                selectedAccount.accountType || ""
            )
                .trim()
                .toLowerCase();

        if (
            normalizedType !== "savings"
        ) {

            toast.error(
                "Only Savings accounts are allowed"
            );

            return;
        }

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

        if (
            !tenure ||
            tenure <= 0
        ) {

            toast.error(
                "Please select a valid loan tenure"
            );

            return;
        }

        if (
            !months ||
            months <= 0
        ) {

            toast.error(
                "Invalid total loan tenure"
            );

            return;
        }

        const confirmLoan =
            window.confirm(
                `Add Personal Loan of ₹${amount.toLocaleString(
                    "en-IN"
                )} for account ${accountNumber}?`
            );

        if (!confirmLoan) {

            return;
        }

        const loan = {

            loanId:
                loanId,

            loanType:
                "Personal Loan",

            loanAmount:
                amount,

            loanTenure:
                tenure,

            totalTenure:
                months,

            interestRate:
                Number(
                    interestRate
                ),

            emiPayable:
                Number(
                    emiPayable
                ),

            totalInterestPayable:
                Number(
                    totalInterestPayable
                ),

            totalCost:
                Number(
                    totalCost
                ),

            accountNumber:
                Number(
                    accountNumber
                ),

            status:
                "P",

            amountAdded:
                false
        };

        setLoading(true);

        try {

            await addLoan(
                loan
            );

            const customerLoan = {

                loanId:
                    loanId,

                loanAmount:
                    amount,

                loanTenure:
                    tenure,

                paidTenure:
                    0,

                totalTenure:
                    months,

                interestRate:
                    Number(
                        interestRate
                    ),

                emiPayable:
                    Number(
                        emiPayable
                    ),

                totalInterestPayable:
                    Number(
                        totalInterestPayable
                    ),

                totalCost:
                    Number(
                        totalCost
                    ),

                amountPaidTillDate:
                    0.0,

                loanDate:
                    new Date()
                        .toISOString()
                        .split("T")[0],

                completeDate:
                    "",

                status:
                    "P",

                savingsAccountNumber:
                    Number(
                        accountNumber
                    ),

                paymentAccountNumber:
                    null,

                loanType:
                    "Personal Loan"
            };

            const response =
                await createCustomerLoanFromAdmin(
                    customerLoan
                );

            const createdCustomerLoan =
                response.data;

            toast.success(
                `Loan ${loanId} and Customer Loan ${createdCustomerLoan.customerLoanId} created successfully`
            );

            navigate(
                "/admin-loans"
            );

        } catch (error) {

            console.error(
                "Loan saving error:",
                error
            );

            console.error(
                "Backend:",
                error.response?.data
            );

            toast.error(
                error.response?.data ||
                "Unable to add loan"
            );

        } finally {

            setLoading(false);

        }
    };

    const resetForm = () => {

        setLoanAmount(
            100000
        );

        setLoanTenure(
            1
        );

        setAccountNumber(
            ""
        );

        setCurrentBalance(
            0
        );

        calculateLoan(
            100000,
            1
        );
    };

    const returnBack = () => {

        navigate(
            "/admin-menu"
        );
    };

    return (

        <div className="loan-addition-page">

            <div className="loan-addition-card">

                <h1 className="loan-addition-title">
                    💰 Loan Addition
                </h1>

                <p className="loan-addition-subtitle">
                    Add a new loan for a customer
                </p>

                <form onSubmit={saveLoan}>

                    <div className="loan-addition-field">

                        <label>
                            Loan ID
                        </label>

                        <input
                            type="text"
                            value={loanId}
                            readOnly
                        />

                        <small>
                            Automatically generated by FinCore
                        </small>

                    </div>

                    <div className="loan-addition-field">

                        <label>
                            Customer Savings Account
                        </label>

                        <select
                            value={accountNumber}
                            onChange={
                                handleAccountChange
                            }
                        >

                            <option value="">
                                -- Select Savings Account --
                            </option>

                            {accounts.map(
                                (account) => (

                                    <option
                                        key={
                                            account.accountNumber
                                        }
                                        value={
                                            account.accountNumber
                                        }
                                    >

                                        {account.accountNumber}
                                        {" | "}
                                        {account.accountType}
                                        {" | Customer ID: "}
                                        {account.customerId}

                                    </option>

                                )
                            )}

                        </select>

                        {accounts.length === 0 && (

                            <small>
                                No Savings accounts found.
                            </small>

                        )}

                    </div>

                    {accountNumber && (

                        <div className="loan-addition-balance">

                            <span>
                                Current Account Balance
                            </span>

                            <strong>
                                ₹{" "}
                                {Number(
                                    currentBalance
                                ).toLocaleString(
                                    "en-IN",
                                    {
                                        minimumFractionDigits: 2
                                    }
                                )}
                            </strong>

                        </div>

                    )}

                    <div className="loan-addition-field">

                        <label>
                            Loan Type
                        </label>

                        <input
                            type="text"
                            value="Personal Loan"
                            readOnly
                        />

                    </div>

                    <div className="loan-addition-field">

                        <label>
                            Loan Amount
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

                        <small>
                            Loan amount must be a multiple of ₹50,000
                        </small>

                    </div>

                    <div className="loan-addition-field">

                        <label>
                            Interest Rate
                        </label>

                        <input
                            type="text"
                            value="20%"
                            readOnly
                        />

                    </div>

                    <div className="loan-addition-field">

                        <label>
                            Loan Tenure
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

                    <div className="loan-addition-field">

                        <label>
                            Total Tenure
                        </label>

                        <input
                            type="text"
                            value={`${totalTenure} Months`}
                            readOnly
                        />

                    </div>

                    <div className="loan-addition-field">

                        <label>
                            EMI Payable
                        </label>

                        <input
                            type="text"
                            value={`₹${Number(
                                emiPayable
                            ).toFixed(2)}`}
                            readOnly
                        />

                    </div>

                    <div className="loan-addition-field">

                        <label>
                            Total Interest Payable
                        </label>

                        <input
                            type="text"
                            value={`₹${Number(
                                totalInterestPayable
                            ).toFixed(2)}`}
                            readOnly
                        />

                    </div>

                    <div className="loan-addition-field">

                        <label>
                            Total Cost
                        </label>

                        <input
                            type="text"
                            value={`₹${Number(
                                totalCost
                            ).toFixed(2)}`}
                            readOnly
                        />

                    </div>

                    <div className="loan-addition-buttons">

                        <button
                            type="submit"
                            className="loan-add-btn save-loan-btn"
                            disabled={loading}
                        >

                            {loading
                                ? "Saving..."
                                : "✓ Add Loan"
                            }

                        </button>

                        <button
                            type="button"
                            className="loan-add-btn reset-loan-btn"
                            onClick={
                                resetForm
                            }
                            disabled={loading}
                        >

                            ↻ Reset

                        </button>

                        <button
                            type="button"
                            className="loan-add-btn return-loan-btn"
                            onClick={
                                returnBack
                            }
                            disabled={loading}
                        >

                            ← Return Back

                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
};

export default LoanAddition;