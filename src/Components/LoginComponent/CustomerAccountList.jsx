import React, {
    useEffect,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import toast from "react-hot-toast";

import {
    getAccountsByCustomerId
} from "../../Services/AccountService";

import "./CustomerAccountList.css";


const CustomerAccountList = () => {

    const navigate =
        useNavigate();


    const [
        accounts,
        setAccounts
    ] = useState([]);


    const [
        loading,
        setLoading
    ] = useState(true);


    // =====================================================
    // LOAD ACCOUNTS
    // =====================================================

    const loadAccounts = () => {

        setLoading(true);

        getAccountsByCustomerId()

            .then((response) => {

                console.log(
                    "Customer Accounts:",
                    response.data
                );

                setAccounts(
                    response.data || []
                );

            })

            .catch((error) => {

                console.error(
                    "Customer account loading error:",
                    error
                );

                setAccounts([]);

                toast.error(
                    "Unable to load account details"
                );

            })

            .finally(() => {

                setLoading(false);

            });

    };


    // =====================================================
    // LOAD ON PAGE OPEN
    // =====================================================

    useEffect(() => {

        loadAccounts();

    }, []);


    // =====================================================
    // FORMAT ACCOUNT TYPE
    // =====================================================

    const formatAccountType = (
        type
    ) => {

        if (!type) {

            return "-";

        }

        const normalizedType =
            String(type)
                .trim()
                .toUpperCase();


        if (
            normalizedType === "LOAN" ||
            normalizedType === "LOAN ACCOUNT"
        ) {

            return "Loan Account";

        }


        if (
            normalizedType === "SAVINGS" ||
            normalizedType === "SAVINGS ACCOUNT"
        ) {

            return "Savings Account";

        }


        if (
            normalizedType === "CURRENT" ||
            normalizedType === "CURRENT ACCOUNT"
        ) {

            return "Current Account";

        }


        return type;

    };


    // =====================================================
    // FORMAT BALANCE
    // =====================================================

    const formatBalance = (
        balance
    ) => {

        const amount =
            Number(balance || 0);


        return amount.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

    };


    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (
        date
    ) => {

        if (!date) {

            return "-";

        }


        const dateString =
            String(date).trim();


        // DD-MM-YYYY

        if (
            /^\d{2}-\d{2}-\d{4}$/.test(
                dateString
            )
        ) {

            const [
                day,
                month,
                year
            ] =
                dateString.split("-");


            return `${day}/${month}/${year}`;

        }


        // YYYY-MM-DD

        if (
            /^\d{4}-\d{2}-\d{2}$/.test(
                dateString
            )
        ) {

            const [
                year,
                month,
                day
            ] =
                dateString.split("-");


            return `${day}/${month}/${year}`;

        }


        // YYYY-MM-DDTHH...

        if (
            /^\d{4}-\d{2}-\d{2}T/.test(
                dateString
            )
        ) {

            const datePart =
                dateString.split("T")[0];


            const [
                year,
                month,
                day
            ] =
                datePart.split("-");


            return `${day}/${month}/${year}`;

        }


        // OTHER VALID DATE FORMAT

        const parsedDate =
            new Date(dateString);


        if (
            !isNaN(
                parsedDate.getTime()
            )
        ) {

            return parsedDate.toLocaleDateString(
                "en-IN"
            );

        }


        return dateString;

    };


    // =====================================================
    // CHECK SAVINGS ACCOUNT
    // =====================================================

    const isSavingsAccount = (
        account
    ) => {

        const accountType =
            String(
                account?.accountType || ""
            )
                .trim()
                .toUpperCase();


        return (
            accountType === "SAVINGS" ||
            accountType === "SAVINGS ACCOUNT"
        );

    };


    // =====================================================
    // CHECK LOAN ACCOUNT
    // =====================================================

    const isLoanAccount = (
        account
    ) => {

        const accountType =
            String(
                account?.accountType || ""
            )
                .trim()
                .toUpperCase();


        return (
            accountType === "LOAN" ||
            accountType === "LOAN ACCOUNT"
        );

    };


    // =====================================================
    // ACCOUNT STATUS
    // =====================================================

    const getStatus = (
        status
    ) => {

        const normalizedStatus =
            String(
                status || ""
            )
                .trim()
                .toUpperCase();


        // ACTIVE

        if (
            normalizedStatus === "A" ||
            normalizedStatus === "ACTIVE" ||
            normalizedStatus === "APPROVED" ||
            normalizedStatus === "D"
        ) {

            return (

                <span className="customer-account-active">
                    ● Active
                </span>

            );

        }


        // COMPLETED

        if (
            normalizedStatus === "C" ||
            normalizedStatus === "COMPLETED"
        ) {

            return (

                <span className="customer-account-active">
                    ● Completed
                </span>

            );

        }


        // PENDING

        if (
            normalizedStatus === "P" ||
            normalizedStatus === "PENDING"
        ) {

            return (

                <span className="customer-account-inactive">
                    ● Pending
                </span>

            );

        }


        // INACTIVE / REJECTED

        if (
            normalizedStatus === "R" ||
            normalizedStatus === "REJECTED" ||
            normalizedStatus === "I" ||
            normalizedStatus === "INACTIVE"
        ) {

            return (

                <span className="customer-account-inactive">
                    ● Inactive
                </span>

            );

        }


        // DEFAULT

        return (

            <span className="customer-account-active">
                ● Active
            </span>

        );

    };


    // =====================================================
    // TOTAL SAVINGS BALANCE
    //
    // ONLY SAVINGS ACCOUNTS ARE INCLUDED
    //
    // LOAN ACCOUNTS ARE EXCLUDED
    // =====================================================

    const totalSavingsBalance =
        accounts
            .filter(
                (account) =>
                    isSavingsAccount(
                        account
                    )
            )
            .reduce(
                (
                    total,
                    account
                ) => {

                    return (
                        total +
                        Number(
                            account.balance || 0
                        )
                    );

                },
                0
            );


    // =====================================================
    // TOTAL SAVINGS ACCOUNTS
    // =====================================================

    const totalSavingsAccounts =
        accounts.filter(
            (account) =>
                isSavingsAccount(
                    account
                )
        ).length;


    // =====================================================
    // ACTIVE SAVINGS ACCOUNTS
    // =====================================================

    const activeSavingsAccountCount =
        accounts.filter(
            (account) => {

                if (
                    !isSavingsAccount(
                        account
                    )
                ) {

                    return false;

                }


                const status =
                    String(
                        account.status || ""
                    )
                        .trim()
                        .toUpperCase();


                return (
                    status === "A" ||
                    status === "ACTIVE" ||
                    status === "APPROVED" ||
                    status === "D"
                );

            }
        ).length;


    // =====================================================
    // TOTAL ACTIVE ACCOUNTS
    // =====================================================

    const activeAccountCount =
        accounts.filter(
            (account) => {

                const status =
                    String(
                        account.status || ""
                    )
                        .trim()
                        .toUpperCase();


                return (
                    status === "A" ||
                    status === "ACTIVE" ||
                    status === "APPROVED" ||
                    status === "D"
                );

            }
        ).length;


    // =====================================================
    // BACK TO CUSTOMER MENU
    // =====================================================

    const returnBack = () => {

        navigate(
            "/customer-menu"
        );

    };


    // =====================================================
    // REFRESH
    // =====================================================

    const refreshAccounts = () => {

        loadAccounts();

    };


    // =====================================================
    // UI
    // =====================================================

    return (

        <div className="customer-account-list-page">

            <div className="customer-account-list-card">


                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="customer-account-header">

                    <div className="customer-account-title-section">

                        <div className="customer-account-icon">
                            🏦
                        </div>

                        <div>

                            <h1>
                                My Account Details
                            </h1>

                            <p>
                                View your account information,
                                balance and status
                            </p>

                        </div>

                    </div>


                    <div className="customer-account-count">

                        {accounts.length}

                        {" "}

                        Account
                        {accounts.length !== 1
                            ? "s"
                            : ""
                        }

                    </div>

                </div>


                {/* =================================================
                    GOLD LINE
                ================================================= */}

                <div className="customer-account-gold-line"></div>


                {/* =================================================
                    LOADING
                ================================================= */}

                {loading && (

                    <div className="customer-account-message">

                        <div className="customer-account-loading-icon">
                            ⏳
                        </div>

                        <h2>
                            Loading Account Details
                        </h2>

                        <p>
                            Please wait while we fetch
                            your account information.
                        </p>

                    </div>

                )}


                {/* =================================================
                    NO ACCOUNTS
                ================================================= */}

                {!loading &&
                    accounts.length === 0 && (

                    <div className="customer-account-message">

                        <div className="customer-account-empty-icon">
                            🏦
                        </div>

                        <h2>
                            No Accounts Found
                        </h2>

                        <p>
                            No accounts are currently
                            linked to your customer profile.
                        </p>

                        <button
                            type="button"
                            className="customer-account-refresh-btn"
                            onClick={
                                refreshAccounts
                            }
                        >
                            ↻ Refresh
                        </button>

                    </div>

                )}


                {/* =================================================
                    ACCOUNT TABLE
                ================================================= */}

                {!loading &&
                    accounts.length > 0 && (

                    <div className="customer-account-table-container">

                        <table className="customer-account-list-table">

                            <thead>

                                <tr>

                                    <th>
                                        Account Number
                                    </th>

                                    <th>
                                        Account Type
                                    </th>

                                    <th>
                                        Balance
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Open Date
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {accounts.map(
                                    (account) => (

                                    <tr
                                        key={
                                            account.accountNumber
                                        }
                                    >

                                        {/* ACCOUNT NUMBER */}

                                        <td>

                                            <span className="customer-account-number">

                                                {
                                                    account.accountNumber
                                                }

                                            </span>

                                        </td>


                                        {/* ACCOUNT TYPE */}

                                        <td>

                                            <span className="customer-account-type">

                                                {
                                                    formatAccountType(
                                                        account.accountType
                                                    )
                                                }

                                            </span>

                                        </td>


                                        {/* BALANCE */}

                                        <td>

                                            <span className="customer-account-balance">

                                                ₹
                                                {
                                                    formatBalance(
                                                        account.balance
                                                    )
                                                }

                                            </span>

                                        </td>


                                        {/* STATUS */}

                                        <td>

                                            {
                                                getStatus(
                                                    account.status
                                                )
                                            }

                                        </td>


                                        {/* OPEN DATE */}

                                        <td>

                                            <span className="customer-account-date">

                                                {
                                                    formatDate(
                                                        account.accountopenDate ??
                                                        account.accountOpenDate
                                                    )
                                                }

                                            </span>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}


                {/* =================================================
                    SUMMARY
                ================================================= */}

                {!loading &&
                    accounts.length > 0 && (

                    <div className="customer-account-summary">


                        {/* TOTAL ACCOUNTS */}

                        <div className="customer-summary-item">

                            <span className="customer-summary-label">
                                Total Accounts
                            </span>

                            <span className="customer-summary-value">

                                {
                                    accounts.length
                                }

                            </span>

                        </div>


                        <div className="customer-summary-divider"></div>


                        {/* ACTIVE ACCOUNTS */}

                        <div className="customer-summary-item">

                            <span className="customer-summary-label">
                                Active Accounts
                            </span>

                            <span className="customer-summary-value">

                                {
                                    activeAccountCount
                                }

                            </span>

                        </div>


                        <div className="customer-summary-divider"></div>


                        {/* SAVINGS ACCOUNTS */}

                        <div className="customer-summary-item">

                            <span className="customer-summary-label">
                                Savings Accounts
                            </span>

                            <span className="customer-summary-value">

                                {
                                    totalSavingsAccounts
                                }

                            </span>

                        </div>


                        <div className="customer-summary-divider"></div>


                        {/* ACTIVE SAVINGS ACCOUNTS */}

                        <div className="customer-summary-item">

                            <span className="customer-summary-label">
                                Active Savings
                            </span>

                            <span className="customer-summary-value">

                                {
                                    activeSavingsAccountCount
                                }

                            </span>

                        </div>


                        <div className="customer-summary-divider"></div>


                        {/* =================================================
                            TOTAL SAVINGS BALANCE

                            IMPORTANT:
                            ONLY SAVINGS ACCOUNTS ARE INCLUDED.

                            LOAN ACCOUNT BALANCES ARE NOT INCLUDED.
                        ================================================= */}

                        <div className="customer-summary-item">

                            <span className="customer-summary-label">
                                Total Savings Balance
                            </span>

                            <span className="customer-summary-value customer-summary-balance">

                                ₹
                                {
                                    formatBalance(
                                        totalSavingsBalance
                                    )
                                }

                            </span>

                        </div>


                    </div>

                )}


                {/* =================================================
                    FOOTER BUTTONS
                ================================================= */}

                <div className="customer-account-list-footer">


                    {/* REFRESH */}

                    <button
                        type="button"
                        className="customer-account-refresh-btn"
                        onClick={
                            refreshAccounts
                        }
                    >
                        ↻ Refresh
                    </button>


                    {/* BACK */}

                    <button
                        type="button"
                        className="customer-account-back-btn"
                        onClick={
                            returnBack
                        }
                    >
                        ← Back to Customer Menu
                    </button>


                </div>


            </div>

        </div>

    );

};


export default CustomerAccountList;