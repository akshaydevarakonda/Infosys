import React, {
    useEffect,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import {
    getAccounts,
    deleteAccountByNumber
} from "../../Services/AccountService";

import {
    getCustomers
} from "../../Services/CustomerService";

import "./AccountList.css";

import toast from "react-hot-toast";

const AccountList = () => {

    const [
        accounts,
        setAccounts
    ] = useState([]);

    const [
        customers,
        setCustomers
    ] = useState([]);

    const navigate =
        useNavigate();

    const loadData = () => {

        getAccounts()

            .then(response => {

                setAccounts(
                    response.data || []
                );

            })

            .catch(error => {

                console.error(
                    "Unable to load accounts:",
                    error
                );

                toast.error(
                    "Unable to load accounts"
                );

            });

        getCustomers()

            .then(response => {

                setCustomers(
                    response.data || []
                );

            })

            .catch(error => {

                console.error(
                    "Unable to load customers:",
                    error
                );

                toast.error(
                    "Unable to load customers"
                );

            });

    };

    useEffect(() => {

        loadData();

    }, []);

    const deleteAccount = (
        accountNumber
    ) => {

        const confirmDelete =
            window.confirm(
                "Are you sure you want to delete this account?"
            );

        if (!confirmDelete) {

            return;

        }

        deleteAccountByNumber(
            accountNumber
        )

            .then(() => {

                setAccounts(
                    previousAccounts =>
                        previousAccounts.filter(
                            account =>
                                account.accountNumber !==
                                accountNumber
                        )
                );

                toast.success(
                    "Account Deleted Successfully 🗑️"
                );

            })

            .catch(error => {

                console.error(
                    "Delete account error:",
                    error
                );

                toast.error(
                    "Unable to delete account ❌"
                );

            });

    };

    const getCustomerName = (
        customerId
    ) => {

        const customer =
            customers.find(
                customer =>
                    customer.customerId ===
                    customerId
            );

        return customer
            ? customer.customerName
            : "-";

    };

    const getAccountType = (
        account
    ) => {

        const type =
            String(
                account.accountType || ""
            )
                .trim()
                .toUpperCase();

        if (
            type === "LOAN" ||
            type === "LOAN ACCOUNT"
        ) {

            return "Loan Account";

        }

        if (
            type === "SAVINGS" ||
            type === "SAVINGS ACCOUNT"
        ) {

            return "Savings Account";

        }

        if (
            type === "CURRENT" ||
            type === "CURRENT ACCOUNT"
        ) {

            return "Current Account";

        }

        return account.accountType || "-";

    };

    const getAccountTypeClass = (
        account
    ) => {

        const type =
            String(
                account.accountType || ""
            )
                .trim()
                .toUpperCase();

        if (
            type === "LOAN" ||
            type === "LOAN ACCOUNT"
        ) {

            return "loan-account-type";

        }

        if (
            type === "SAVINGS" ||
            type === "SAVINGS ACCOUNT"
        ) {

            return "savings-account-type";

        }

        if (
            type === "CURRENT" ||
            type === "CURRENT ACCOUNT"
        ) {

            return "current-account-type";

        }

        return "other-account-type";

    };

    const getStatusInfo = (
        account
    ) => {

        const status =
            String(
                account.status || ""
            )
                .trim()
                .toUpperCase();

        if (
            status === "A" ||
            status === "ACTIVE" ||
            status === "APPROVED" ||
            status === "D"
        ) {

            return {
                active: true,
                text: "Active"
            };

        }

        if (
            status === "C" ||
            status === "COMPLETED"
        ) {

            return {
                active: true,
                text: "Completed"
            };

        }

        if (
            status === "P" ||
            status === "PENDING"
        ) {

            return {
                active: false,
                text: "Pending"
            };

        }

        if (
            status === "R" ||
            status === "REJECTED" ||
            status === "INACTIVE" ||
            status === "I"
        ) {

            return {
                active: false,
                text: "Inactive"
            };

        }

        return {
            active: true,
            text: account.status || "Active"
        };

    };

    const formatBalance = (
        balance
    ) => {

        const value =
            Number(balance || 0);

        return value.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

    };

    const formatOpenDate = (
        date
    ) => {

        if (!date) {

            return "-";

        }

        const dateString =
            String(date).trim();

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

    return (

        <div className="account-list-page">

            <div className="account-list-card">

                <div className="account-list-header">

                    <div>

                        <h1>
                            💳 Account List
                        </h1>

                        <p>
                            View and manage all customer accounts
                        </p>

                    </div>

                    <div className="account-count">

                        {accounts.length}

                        <span>
                            Accounts
                        </span>

                    </div>

                </div>

                <div className="account-table-wrapper">

                    <table className="account-list-table">

                        <thead>

                            <tr>

                                <th>
                                    Account Number
                                </th>

                                <th>
                                    Customer ID
                                </th>

                                <th>
                                    Customer Name
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

                                <th>
                                    Action
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {accounts.length === 0 && (

                                <tr>

                                    <td
                                        colSpan="8"
                                        className="account-empty-row"
                                    >
                                        No accounts found.
                                    </td>

                                </tr>

                            )}

                            {accounts.map(
                                account => {

                                    const statusInfo =
                                        getStatusInfo(
                                            account
                                        );

                                    return (

                                        <tr
                                            key={
                                                account.accountNumber
                                            }
                                        >

                                            <td>

                                                <strong className="account-number">

                                                    {
                                                        account.accountNumber
                                                    }

                                                </strong>

                                            </td>

                                            <td>
                                                {
                                                    account.customerId
                                                }
                                            </td>

                                            <td>

                                                <strong>

                                                    {
                                                        getCustomerName(
                                                            account.customerId
                                                        )
                                                    }

                                                </strong>

                                            </td>

                                            <td>

                                                <span
                                                    className={`account-type-badge ${
                                                        getAccountTypeClass(
                                                            account
                                                        )
                                                    }`}
                                                >
                                                    {
                                                        getAccountType(
                                                            account
                                                        )
                                                    }
                                                </span>

                                            </td>

                                            <td className="account-balance">

                                                ₹
                                                {
                                                    formatBalance(
                                                        account.balance
                                                    )
                                                }

                                            </td>

                                            <td>

                                                <span
                                                    className={
                                                        statusInfo.active
                                                            ? "active-status"
                                                            : "inactive-status"
                                                    }
                                                >
                                                    ●{" "}
                                                    {
                                                        statusInfo.text
                                                    }
                                                </span>

                                            </td>

                                            <td>

                                                {
                                                    formatOpenDate(
                                                        account.accountopenDate ??
                                                        account.accountOpenDate
                                                    )
                                                }

                                            </td>

                                            <td>

                                                <button
                                                    type="button"
                                                    className="account-delete-btn"
                                                    onClick={() =>
                                                        deleteAccount(
                                                            account.accountNumber
                                                        )
                                                    }
                                                >
                                                    🗑 Delete
                                                </button>

                                            </td>

                                        </tr>

                                    );

                                }
                            )}

                        </tbody>

                    </table>

                </div>

                <div className="account-list-footer">

                    <button
                        type="button"
                        className="fincore-btn-secondary"
                        onClick={() =>
                            navigate(
                                "/admin-menu"
                            )
                        }
                    >
                        ← Back to Admin Menu
                    </button>

                </div>

            </div>

        </div>

    );

};

export default AccountList;