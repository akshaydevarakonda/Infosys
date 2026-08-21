import React, {
    useEffect,
    useState
} from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import toast from "react-hot-toast";

import {
    getCustomerLoansByCustomerId,
    approveCustomerLoan,
    rejectCustomerLoan,
    addLoanAmountToAccount
} from "../../Services/CustomerLoanService";

import "../../DisplayView.css";
import "../../FinCorePage.css";
import "./AdminAppliedLoanView.css";


const AdminAppliedLoanView = () => {

    const navigate =
        useNavigate();

    /*
     * CUSTOMER ID COMES FROM URL
     *
     * Example:
     * /admin-applied-loan/1000001
     */
    const {
        customerId
    } = useParams();


    // =====================================================
    // STATE
    // =====================================================

    const [
        pendingLoans,
        setPendingLoans
    ] = useState([]);

    const [
        acceptedLoans,
        setAcceptedLoans
    ] = useState([]);

    const [
        emiLoans,
        setEmiLoans
    ] = useState([]);

    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        actionLoading,
        setActionLoading
    ] = useState("");

    const [
        error,
        setError
    ] = useState("");


    // =====================================================
    // LOAD CUSTOMER LOANS
    // =====================================================

    useEffect(() => {

        if (
            customerId !== undefined &&
            customerId !== null &&
            String(customerId).trim() !== ""
        ) {

            loadLoans();

        }
        else {

            setLoading(false);

            setError(
                "Customer ID not found"
            );

        }

    }, [customerId]);


    // =====================================================
    // LOAD ONLY PARTICULAR CUSTOMER LOANS
    // =====================================================

    const loadLoans = async () => {

        setLoading(true);

        setError("");


        try {

            console.log(
                "Loading loans for customer:",
                customerId
            );


            const response =
                await getCustomerLoansByCustomerId(
                    customerId
                );


            console.log(
                "Customer Loan Response:",
                response.data
            );


            const loans =
                Array.isArray(
                    response.data
                )
                    ? response.data
                    : [];


            /*
             * IMPORTANT:
             *
             * We use ONLY the loans returned for
             * this customer.
             *
             * Then divide them by status.
             */


            // =================================================
            // PENDING
            // =================================================

            const pending =
                loans.filter(
                    (loan) => {

                        const status =
                            String(
                                loan.status || ""
                            )
                                .trim()
                                .toUpperCase();

                        return (
                            status === "P"
                        );

                    }
                );


            // =================================================
            // ACCEPTED
            // =================================================

            const accepted =
                loans.filter(
                    (loan) => {

                        const status =
                            String(
                                loan.status || ""
                            )
                                .trim()
                                .toUpperCase();

                        return (
                            status === "A"
                        );

                    }
                );


            // =================================================
            // EMI PAYMENT
            // =================================================

            const emi =
                loans.filter(
                    (loan) => {

                        const status =
                            String(
                                loan.status || ""
                            )
                                .trim()
                                .toUpperCase();


                        const paidTenure =
                            Number(
                                loan.paidTenure || 0
                            );


                        const totalTenure =
                            Number(
                                loan.totalTenure || 0
                            );


                        /*
                         * D = Amount Disbursed
                         *
                         * It is available for EMI
                         * until all tenures are paid.
                         */

                        return (
                            status === "D" &&
                            paidTenure <
                                totalTenure
                        );

                    }
                );


            setPendingLoans(
                pending
            );


            setAcceptedLoans(
                accepted
            );


            setEmiLoans(
                emi
            );


            console.log(
                "Pending Loans:",
                pending
            );


            console.log(
                "Accepted Loans:",
                accepted
            );


            console.log(
                "EMI Loans:",
                emi
            );

        }
        catch (error) {

            console.error(
                "Customer loan loading error:",
                error
            );


            setPendingLoans([]);

            setAcceptedLoans([]);

            setEmiLoans([]);


            setError(
                "Unable to load customer loans"
            );


            toast.error(
                "Unable to load customer loans"
            );

        }
        finally {

            setLoading(false);

        }

    };


    // =====================================================
    // FORMAT AMOUNT
    // =====================================================

    const formatAmount = (
        amount
    ) => {

        const value =
            Number(amount);


        if (
            isNaN(value)
        ) {

            return "₹0.00";

        }


        return `₹${value.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )}`;

    };


    // =====================================================
    // STATUS TEXT
    // =====================================================

    const getStatusText = (
        status
    ) => {

        const value =
            String(
                status || ""
            )
                .trim()
                .toUpperCase();


        switch (value) {

            case "P":
                return "Applied";

            case "A":
                return "Accepted";

            case "D":
                return "Amount Added";

            case "C":
                return "Completed";

            case "R":
                return "Rejected";

            default:
                return value ||
                    "Unknown";

        }

    };


    // =====================================================
    // STATUS CLASS
    // =====================================================

    const getStatusClass = (
        status
    ) => {

        const value =
            String(
                status || ""
            )
                .trim()
                .toUpperCase();


        switch (value) {

            case "P":
                return "admin-loan-status-pending";

            case "A":
                return "admin-loan-status-accepted";

            case "D":
                return "admin-loan-status-added";

            case "C":
                return "admin-loan-status-completed";

            case "R":
                return "admin-loan-status-rejected";

            default:
                return "admin-loan-status-default";

        }

    };


    // =====================================================
    // APPROVE
    // =====================================================

    const handleApprove = async (
        loan
    ) => {

        const customerLoanId =
            loan.customerLoanId;


        if (!customerLoanId) {

            toast.error(
                "Customer Loan ID not found"
            );

            return;

        }


        setActionLoading(
            `approve-${customerLoanId}`
        );


        try {

            await approveCustomerLoan(
                customerLoanId
            );


            toast.success(
                "Customer loan approved successfully"
            );


            await loadLoans();

        }
        catch (error) {

            console.error(
                "Approve Loan Error:",
                error
            );


            const message =
                error?.response?.data ||
                "Unable to approve customer loan";


            toast.error(
                message
            );

        }
        finally {

            setActionLoading("");

        }

    };


    // =====================================================
    // REJECT
    // =====================================================

    const handleReject = async (
        loan
    ) => {

        const customerLoanId =
            loan.customerLoanId;


        if (!customerLoanId) {

            toast.error(
                "Customer Loan ID not found"
            );

            return;

        }


        const confirmReject =
            window.confirm(
                `Are you sure you want to reject loan ${customerLoanId}?`
            );


        if (!confirmReject) {

            return;

        }


        setActionLoading(
            `reject-${customerLoanId}`
        );


        try {

            await rejectCustomerLoan(
                customerLoanId
            );


            toast.success(
                "Customer loan rejected successfully"
            );


            await loadLoans();

        }
        catch (error) {

            console.error(
                "Reject Loan Error:",
                error
            );


            const message =
                error?.response?.data ||
                "Unable to reject customer loan";


            toast.error(
                message
            );

        }
        finally {

            setActionLoading("");

        }

    };


    // =====================================================
    // ADD LOAN AMOUNT
    // =====================================================

    const handleAddLoanAmount = async (
        loan
    ) => {

        const customerLoanId =
            loan.customerLoanId;


        if (!customerLoanId) {

            toast.error(
                "Customer Loan ID not found"
            );

            return;

        }


        const confirmAdd =
            window.confirm(
                `Add ${formatAmount(
                    loan.loanAmount
                )} to the customer's savings account?`
            );


        if (!confirmAdd) {

            return;

        }


        setActionLoading(
            `add-${customerLoanId}`
        );


        try {

            await addLoanAmountToAccount(
                customerLoanId
            );


            toast.success(
                "Loan amount added and loan account created successfully"
            );


            await loadLoans();

        }
        catch (error) {

            console.error(
                "Add Loan Amount Error:",
                error
            );


            const message =
                error?.response?.data ||
                "Unable to add loan amount";


            toast.error(
                message
            );

        }
        finally {

            setActionLoading("");

        }

    };


    // =====================================================
    // PAY EMI
    // =====================================================

    const handlePayEmi = (
        loan
    ) => {

        if (!loan) {

            toast.error(
                "Loan details not found"
            );

            return;

        }


        if (!loan.customerLoanId) {

            toast.error(
                "Customer Loan ID not found"
            );

            return;

        }


        navigate(
            "/customer-loan-payment",
            {
                state: {
                    loan: loan,
                    customerId: customerId
                }
            }
        );

    };


    // =====================================================
    // RENDER LOAN CARD
    // =====================================================

    const renderLoanCard = (
        loan,
        index
    ) => {

        const status =
            String(
                loan.status || ""
            )
                .trim()
                .toUpperCase();


        const customerLoanId =
            loan.customerLoanId ||
            `loan-${index}`;


        const paidTenure =
            Number(
                loan.paidTenure || 0
            );


        const totalTenure =
            Number(
                loan.totalTenure || 0
            );


        const remainingTenure =
            Math.max(
                totalTenure -
                paidTenure,
                0
            );


        const isApproving =
            actionLoading ===
            `approve-${customerLoanId}`;


        const isRejecting =
            actionLoading ===
            `reject-${customerLoanId}`;


        const isAdding =
            actionLoading ===
            `add-${customerLoanId}`;


        const isPaymentAvailable =
            status === "D" &&
            paidTenure <
                totalTenure;


        return (

            <div
                className="admin-applied-loan-card"
                key={customerLoanId}
            >


                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="admin-applied-loan-card-header">

                    <div className="admin-applied-loan-card-title">

                        <span className="admin-applied-loan-label">
                            Customer Loan ID
                        </span>

                        <h2>
                            {
                                loan.customerLoanId ||
                                "-"
                            }
                        </h2>

                    </div>


                    <span
                        className={
                            `admin-applied-loan-status ${
                                getStatusClass(
                                    loan.status
                                )
                            }`
                        }
                    >

                        {
                            getStatusText(
                                loan.status
                            )
                        }

                    </span>

                </div>


                {/* =================================================
                    DETAILS
                ================================================= */}

                <div className="admin-applied-loan-details">


                    {/* CUSTOMER ID */}

                    <div className="admin-applied-loan-detail customer-detail">

                        <span>
                            Customer ID
                        </span>

                        <strong>
                            {
                                loan.customerId ||
                                customerId ||
                                "-"
                            }
                        </strong>

                    </div>


                    {/* LOAN TYPE */}

                    <div className="admin-applied-loan-detail loan-type-detail">

                        <span>
                            Loan Type
                        </span>

                        <strong>
                            {
                                loan.loanType ||
                                "-"
                            }
                        </strong>

                    </div>


                    {/* LOAN ID */}

                    <div className="admin-applied-loan-detail">

                        <span>
                            Loan ID
                        </span>

                        <strong>
                            {
                                loan.loanId ||
                                "-"
                            }
                        </strong>

                    </div>


                    {/* LOAN AMOUNT */}

                    <div className="admin-applied-loan-detail">

                        <span>
                            Loan Amount
                        </span>

                        <strong className="admin-applied-loan-amount">

                            {
                                formatAmount(
                                    loan.loanAmount
                                )
                            }

                        </strong>

                    </div>


                    {/* INTEREST */}

                    <div className="admin-applied-loan-detail">

                        <span>
                            Interest Rate
                        </span>

                        <strong>
                            {
                                loan.interestRate ||
                                0
                            }%
                        </strong>

                    </div>


                    {/* EMI */}

                    <div className="admin-applied-loan-detail">

                        <span>
                            EMI
                        </span>

                        <strong>
                            {
                                formatAmount(
                                    loan.emiPayable
                                )
                            }
                        </strong>

                    </div>


                    {/* LOAN TENURE */}

                    <div className="admin-applied-loan-detail">

                        <span>
                            Loan Tenure
                        </span>

                        <strong>
                            {
                                loan.loanTenure ||
                                "-"
                            } Years
                        </strong>

                    </div>


                    {/* TOTAL TENURE */}

                    <div className="admin-applied-loan-detail">

                        <span>
                            Total Tenure
                        </span>

                        <strong>
                            {
                                totalTenure
                            } Months
                        </strong>

                    </div>


                    {/* PAID TENURES */}

                    <div className="admin-applied-loan-detail">

                        <span>
                            Paid Tenures
                        </span>

                        <strong>
                            {
                                paidTenure
                            }
                        </strong>

                    </div>


                    {/* REMAINING */}

                    <div className="admin-applied-loan-detail">

                        <span>
                            Remaining Tenures
                        </span>

                        <strong className="admin-remaining-tenure">

                            {
                                remainingTenure
                            } Months

                        </strong>

                    </div>


                    {/* TOTAL INTEREST */}

                    <div className="admin-applied-loan-detail">

                        <span>
                            Total Interest
                        </span>

                        <strong>
                            {
                                formatAmount(
                                    loan.totalInterestPayable
                                )
                            }
                        </strong>

                    </div>


                    {/* TOTAL COST */}

                    <div className="admin-applied-loan-detail">

                        <span>
                            Total Cost
                        </span>

                        <strong>
                            {
                                formatAmount(
                                    loan.totalCost
                                )
                            }
                        </strong>

                    </div>


                    {/* AMOUNT PAID */}

                    <div className="admin-applied-loan-detail">

                        <span>
                            Amount Paid
                        </span>

                        <strong>
                            {
                                formatAmount(
                                    loan.amountPaidTillDate
                                )
                            }
                        </strong>

                    </div>


                    {/* LOAN DATE */}

                    <div className="admin-applied-loan-detail">

                        <span>
                            Loan Date
                        </span>

                        <strong>
                            {
                                loan.loanDate ||
                                "-"
                            }
                        </strong>

                    </div>


                    {/* SAVINGS ACCOUNT */}

                    <div className="admin-applied-loan-detail">

                        <span>
                            Savings Account
                        </span>

                        <strong>
                            {
                                loan.savingsAccountNumber ||
                                "-"
                            }
                        </strong>

                    </div>


                    {/* LOAN ACCOUNT */}

                    <div className="admin-applied-loan-detail">

                        <span>
                            Loan Account
                        </span>

                        <strong>
                            {
                                loan.paymentAccountNumber ||
                                "-"
                            }
                        </strong>

                    </div>


                </div>


                {/* =================================================
                    PENDING
                ================================================= */}

                {status === "P" && (

                    <div className="admin-applied-loan-action-area pending-area">

                        <div className="admin-applied-loan-action-message">

                            <span>
                                ⏳
                            </span>

                            <div>

                                <strong>
                                    Loan Application Pending
                                </strong>

                                <p>
                                    Review this application
                                    and approve or reject
                                    the loan.
                                </p>

                            </div>

                        </div>


                        <div className="admin-applied-loan-buttons">

                            <button
                                type="button"
                                className="admin-loan-approve-btn"
                                disabled={
                                    isApproving ||
                                    isRejecting
                                }
                                onClick={() =>
                                    handleApprove(
                                        loan
                                    )
                                }
                            >

                                {
                                    isApproving
                                        ? "Approving..."
                                        : "✓ Approve Loan"
                                }

                            </button>


                            <button
                                type="button"
                                className="admin-loan-reject-btn"
                                disabled={
                                    isApproving ||
                                    isRejecting
                                }
                                onClick={() =>
                                    handleReject(
                                        loan
                                    )
                                }
                            >

                                {
                                    isRejecting
                                        ? "Rejecting..."
                                        : "✕ Reject Loan"
                                }

                            </button>

                        </div>

                    </div>

                )}


                {/* =================================================
                    ACCEPTED
                ================================================= */}

                {status === "A" && (

                    <div className="admin-applied-loan-action-area accepted-area">

                        <div className="admin-applied-loan-action-message">

                            <span>
                                ✓
                            </span>

                            <div>

                                <strong>
                                    Loan Approved
                                </strong>

                                <p>
                                    This loan has been approved.
                                    You can now add the loan
                                    amount to the customer's
                                    savings account.
                                </p>

                            </div>

                        </div>


                        <button
                            type="button"
                            className="admin-loan-add-amount-btn"
                            disabled={
                                isAdding
                            }
                            onClick={() =>
                                handleAddLoanAmount(
                                    loan
                                )
                            }
                        >

                            <span>
                                💰
                            </span>

                            {
                                isAdding
                                    ? "Adding Amount..."
                                    : "Add Loan Amount"
                            }

                        </button>

                    </div>

                )}


                {/* =================================================
                    EMI PAYMENT
                ================================================= */}

                {status === "D" && (

                    <div className="admin-applied-loan-payment-area">


                        <div className="admin-applied-loan-payment-message">

                            <span className="admin-payment-icon">
                                ✓
                            </span>

                            <div>

                                <strong>
                                    Loan Amount Added
                                </strong>

                                <p>
                                    Loan amount has been added
                                    to the customer's savings
                                    account. This loan is now
                                    available for EMI repayment.
                                </p>

                            </div>

                        </div>


                        <div className="admin-applied-loan-payment-summary">


                            <div className="admin-payment-summary-item">

                                <span>
                                    Next EMI
                                </span>

                                <strong>
                                    {
                                        formatAmount(
                                            loan.emiPayable
                                        )
                                    }
                                </strong>

                            </div>


                            <div className="admin-payment-summary-item">

                                <span>
                                    EMI Number
                                </span>

                                <strong>
                                    {
                                        paidTenure + 1
                                    }
                                </strong>

                            </div>


                            <div className="admin-payment-summary-item">

                                <span>
                                    Remaining
                                </span>

                                <strong>
                                    {
                                        remainingTenure
                                    } Months
                                </strong>

                            </div>


                        </div>


                        {isPaymentAvailable && (

                            <button
                                type="button"
                                className="admin-applied-loan-pay-btn"
                                onClick={() =>
                                    handlePayEmi(
                                        loan
                                    )
                                }
                            >

                                <span>
                                    💳
                                </span>

                                Pay EMI

                            </button>

                        )}

                    </div>

                )}


                {/* =================================================
                    COMPLETED
                ================================================= */}

                {status === "C" && (

                    <div className="admin-applied-loan-completed-area">

                        <span>
                            ✓
                        </span>

                        <strong>
                            All EMI payments completed
                        </strong>

                    </div>

                )}

            </div>

        );

    };


    // =====================================================
    // BACK
    // =====================================================

    const handleBack = () => {

        navigate(-1);

    };


    // =====================================================
    // UI
    // =====================================================

    return (

        <div className="admin-applied-loan-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="admin-applied-loan-heading">

                <div className="admin-applied-loan-heading-icon">
                    📋
                </div>

                <h1>
                    Customer Applied Loans
                </h1>

                <p>
                    Loans applied by customer{" "}
                    <strong>
                        {customerId}
                    </strong>
                </p>

            </div>


            {/* =================================================
                CUSTOMER ID
            ================================================= */}

            {!loading &&
                !error && (

                    <div className="admin-customer-loan-info">

                        <span>
                            Customer ID
                        </span>

                        <strong>
                            {
                                customerId
                            }
                        </strong>

                    </div>

                )}


            {/* =================================================
                SUMMARY
            ================================================= */}

            {!loading &&
                !error && (

                    <div className="admin-applied-loan-summary">


                        <div className="admin-loan-summary-card">

                            <span>
                                Pending Applications
                            </span>

                            <strong>
                                {
                                    pendingLoans.length
                                }
                            </strong>

                        </div>


                        <div className="admin-loan-summary-card accepted-summary">

                            <span>
                                Approved Loans
                            </span>

                            <strong>
                                {
                                    acceptedLoans.length
                                }
                            </strong>

                        </div>


                        <div className="admin-loan-summary-card emi-summary">

                            <span>
                                EMI Payment Loans
                            </span>

                            <strong>
                                {
                                    emiLoans.length
                                }
                            </strong>

                        </div>

                    </div>

                )}


            {/* =================================================
                LOADING
            ================================================= */}

            {loading && (

                <div className="admin-applied-loan-message">

                    <div className="admin-applied-loan-spinner">
                    </div>

                    <p>
                        Loading customer loan applications...
                    </p>

                </div>

            )}


            {/* =================================================
                ERROR
            ================================================= */}

            {!loading &&
                error && (

                    <div className="admin-applied-loan-error">

                        <div className="admin-applied-loan-error-icon">
                            ⚠️
                        </div>

                        <h3>
                            Unable to Load Loans
                        </h3>

                        <p>
                            {error}
                        </p>

                        <button
                            type="button"
                            className="admin-applied-loan-retry-btn"
                            onClick={
                                loadLoans
                            }
                        >
                            ↻ Try Again
                        </button>

                    </div>

                )}


            {/* =================================================
                NO LOANS
            ================================================= */}

            {!loading &&
                !error &&
                pendingLoans.length === 0 &&
                acceptedLoans.length === 0 &&
                emiLoans.length === 0 && (

                    <div className="admin-applied-loan-empty">

                        <div className="admin-applied-loan-empty-icon">
                            📋
                        </div>

                        <h2>
                            No Loan Applications
                        </h2>

                        <p>
                            Customer{" "}
                            <strong>
                                {customerId}
                            </strong>{" "}
                            has no pending, approved or
                            active EMI loans.
                        </p>

                    </div>

                )}


            {/* =================================================
                PENDING
            ================================================= */}

            {!loading &&
                !error &&
                pendingLoans.length > 0 && (

                    <div className="admin-applied-loan-section">

                        <div className="admin-applied-loan-section-heading">

                            <div>

                                <span className="section-heading-icon">
                                    ⏳
                                </span>

                                <div>

                                    <h2>
                                        Pending Applications
                                    </h2>

                                    <p>
                                        Loans waiting for admin approval
                                    </p>

                                </div>

                            </div>


                            <span className="section-count">

                                {
                                    pendingLoans.length
                                }

                            </span>

                        </div>


                        <div className="admin-applied-loan-list">

                            {
                                pendingLoans.map(
                                    renderLoanCard
                                )
                            }

                        </div>

                    </div>

                )}


            {/* =================================================
                ACCEPTED
            ================================================= */}

            {!loading &&
                !error &&
                acceptedLoans.length > 0 && (

                    <div className="admin-applied-loan-section accepted-section">

                        <div className="admin-applied-loan-section-heading">

                            <div>

                                <span className="section-heading-icon">
                                    ✓
                                </span>

                                <div>

                                    <h2>
                                        Approved Loans
                                    </h2>

                                    <p>
                                        Approved loans waiting
                                        for amount disbursement
                                    </p>

                                </div>

                            </div>


                            <span className="section-count accepted-count">

                                {
                                    acceptedLoans.length
                                }

                            </span>

                        </div>


                        <div className="admin-applied-loan-list">

                            {
                                acceptedLoans.map(
                                    renderLoanCard
                                )
                            }

                        </div>

                    </div>

                )}


            {/* =================================================
                EMI PAYMENT
            ================================================= */}

            {!loading &&
                !error &&
                emiLoans.length > 0 && (

                    <div className="admin-applied-loan-section emi-payment-section">

                        <div className="admin-applied-loan-section-heading">

                            <div>

                                <span className="section-heading-icon">
                                    💳
                                </span>

                                <div>

                                    <h2>
                                        EMI Payment Loans
                                    </h2>

                                    <p>
                                        Loans belonging to this
                                        customer that are available
                                        for repayment.
                                    </p>

                                </div>

                            </div>


                            <span className="section-count emi-section-count">

                                {
                                    emiLoans.length
                                }

                            </span>

                        </div>


                        <div className="admin-applied-loan-list">

                            {
                                emiLoans.map(
                                    renderLoanCard
                                )
                            }

                        </div>

                    </div>

                )}


            {/* =================================================
                BACK BUTTON
            ================================================= */}

            <div className="admin-applied-loan-back-container">

                <button
                    type="button"
                    className="admin-applied-loan-back-btn"
                    onClick={
                        handleBack
                    }
                >
                    ← Back
                </button>

            </div>


        </div>

    );

};


export default AdminAppliedLoanView;