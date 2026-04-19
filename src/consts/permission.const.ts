const PERMISSIONS = {
  Dashboard: [
    { name: "View Dashboard", key: "dashboard.view" },
    {
      name: "Summary Card",
      key: "dashboard.summary",
    },
    {
      name: "Loan Performance Overview",
      key: "dashboard.performance",
    },
    {
      name: "Portfolio Distribution by Product",
      key: "dashboard.portfolio",
    },
    {
      name: "Count of Loans by Status",
      key: "dashboard.loan_status",
    },
    {
      name: "Latest Applications",
      key: "dashboard.applications",
    },
    {
      name: "Upcoming Repayments (Next 7 Days)",
      key: "dashboard.upcoming_repayments",
    },
  ],
  Borrowers: [
    { name: "View Borrower List", key: "borrowers.list" },
    { name: "View Borrower Details", key: "borrowers.view" },
    { name: "Create Borrower", key: "borrowers.create" },
    { name: "Edit Borrower", key: "borrowers.edit" },
  ],
  Products: [
    { name: "View Product List", key: "products.list" },
    { name: "View Product Details", key: "products.view" },
    { name: "Create Product", key: "products.create" },
    { name: "Edit Product", key: "products.edit" },
  ],
  "Loan Profiles": [
    { name: "View Profile List", key: "profiles.list" },
    { name: "View Profile Details", key: "profiles.view" },
    { name: "Create Profile", key: "profiles.create" },
    { name: "Edit Profile", key: "profiles.edit" },
  ],
  "Loan Applications": [
    { name: "View Application List", key: "applications.list" },
    { name: "View Application Details", key: "applications.view" },
    { name: "Create Application", key: "applications.create" },
    { name: "Edit Application", key: "applications.edit" },
  ],
  Loans: [
    { name: "View Loan List", key: "loans.list" },
    { name: "View Loan Details", key: "loans.view" },
    { name: "Create Loan", key: "loans.create" },
    { name: "Edit Loan", key: "loans.edit" },
  ],
  Repayments: [
    { name: "View Repayment List", key: "repayments.list" },
    { name: "View Repayment Details", key: "repayments.view" },
    { name: "Create Repayment", key: "repayments.create" },
    { name: "Edit Repayment", key: "repayments.edit" },
  ],
  "NPL Monitor": [{ name: "View NPL List", key: "npl.list" }],
  "Document Management": [
    { name: "View Document List", key: "documents.list" },
    { name: "View Document Details", key: "documents.view" },
    { name: "Create Document", key: "documents.create" },
    { name: "Edit Document", key: "documents.edit" },
  ],
  "Attribute Management": [{ name: "View Attribute List", key: "attributes.list" }],
  "User Access": [
    { name: "View User List", key: "users.list" },
    { name: "View User Details", key: "users.view" },
    { name: "Create User", key: "users.create" },
    { name: "Edit User", key: "users.edit" },
  ],
  "Group Management": [
    { name: "View Group List", key: "groups.list" },
    { name: "View Group Details", key: "groups.view" },
    { name: "Create Group", key: "groups.create" },
    { name: "Edit Group", key: "groups.edit" },
  ],
  "Role Management": [
    { name: "View Role List", key: "roles.list" },
    { name: "View Role Details", key: "roles.view" },
    { name: "Create Role", key: "roles.create" },
    { name: "Edit Role", key: "roles.edit" },
  ],
} as const satisfies Record<string, readonly { name: string; key: string }[]>

const PERMISSION_KEYS = Object.values(PERMISSIONS).flatMap((group) => group.map((item) => item.key))

export { PERMISSIONS, PERMISSION_KEYS }
