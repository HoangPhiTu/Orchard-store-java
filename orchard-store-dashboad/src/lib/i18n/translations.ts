/**
 * Translation keys for the application
 * Supports Vietnamese (vi) and English (en)
 */

export type Locale = "vi" | "en";

export interface Translations {
  // Auth - Login
  auth: {
    login: {
      credentialsFilled: string;
      emailFilled: string;
      failedToLoadCredentials: string;
      signedInSuccessfully: string;
      pleaseCompleteSecurityVerification: string;
      securityVerificationFailed: string;
      cannotVerifySecurity: string;
      connectionTimeout: string;
      emailOrPasswordIncorrect: string;
      welcomeBack: string;
      enterDetailsToSignIn: string;
      email: string;
      password: string;
      forgotPassword: string;
      rememberMe: string;
      signIn: string;
      dontHaveAccount: string;
      contactAdmin: string;
      quickLogin: string;
      saved: string;
      noSavedAccounts: string;
      recentLoginsWillAppear: string;
      lastLogin: string;
      securityVerification: string;
      developmentMode: string;
      securityVerificationOptional: string;
      pleaseCompleteSecurityVerificationToLogin: string;
    };
    forgotPassword: {
      resetYourPassword: string;
      enterEmailToReset: string;
      forgotYourPassword: string;
      enterEmailAndWeWillSendOtp: string;
      emailAddress: string;
      sendOtpCode: string;
      backToLogin: string;
      checkYourEmail: string;
      weSentVerificationCode: string;
      otpCodeSentTo: string;
      whatsNext: string;
      checkInboxForOtp: string;
      enterSixDigitCode: string;
      otpCodeExpiresIn5Minutes: string;
      continueToVerifyOtp: string;
      sendToDifferentEmail: string;
      otpCodeSent: string;
    };
    verifyOtp: {
      verifyOtpCode: string;
      enterSixDigitCodeSentTo: string;
      otpCode: string;
      verifyOtp: string;
      resendOtp: string;
      resending: string;
      backToLogin: string;
      emailRequired: string;
      otpVerifiedSuccessfully: string;
      invalidOtpCode: string;
      otpCodeResentSuccessfully: string;
      failedToResendOtp: string;
      otpVerified: string;
      yourOtpHasBeenVerified: string;
      redirectingToResetPassword: string;
      verifyYourIdentity: string;
      enterSixDigitCodeToVerify: string;
    };
    resetPassword: {
      invalidOrMissingEmailOtp: string;
      otpExpired: string;
      yourOtpExpiredOrInvalid: string;
      requestNewOtp: string;
      passwordResetSuccessfully: string;
      failedToResetPassword: string;
      passwordResetFailed: string;
      createYourNewPassword: string;
      enterNewPasswordBelow: string;
      enterNewPasswordAtLeast: string;
      newPassword: string;
      confirmPassword: string;
      resetPassword: string;
    };
    common: {
      error: string;
      success: string;
      loading: string;
      pleaseTryAgain: string;
    };
  };
  admin: {
    menu: {
      dashboard: string;
      brands: string;
      categories: string;
      concentrations: string;
      attributes: string;
      warehouses: string;
      users: string;
    };
    layout: {
      storeAdmin: string;
      orchard: string;
      adminConsole: string;
      expandSidebar: string;
      collapseSidebar: string;
      help: string;
      notifications: string;
      account: string;
      profile: string;
      billing: string;
      settings: string;
      logOut: string;
      adminUser: string;
      language: string;
      vietnamese: string;
      english: string;
    };
    dashboard: {
      totalRevenue: string;
      totalOrders: string;
      newCustomers: string;
      lowStock: string;
      vsLastMonth: string;
      recentOrders: string;
      topProducts: string;
      orderId: string;
      customer: string;
      product: string;
      amount: string;
      status: string;
      date: string;
      productName: string;
      sales: string;
      quantity: string;
      revenueOverTime: string;
      last7Days: string;
      topSellingProducts: string;
      thisWeek: string;
      viewAll: string;
    };
    common: {
      search: string;
      filter: string;
      export: string;
      import: string;
      addNew: string;
      edit: string;
      delete: string;
      save: string;
      cancel: string;
      confirm: string;
      actions: string;
      noData: string;
      loading: string;
      error: string;
      success: string;
      name: string;
      email: string;
      phone: string;
      address: string;
      createdAt: string;
      updatedAt: string;
    };
    users: {
      userManagement: string;
      manageAllStaffMembers: string;
      addUser: string;
      searchByNameEmailPhone: string;
      display: string;
      rowsPerPage: string;
      loadingUsers: string;
      noUsersFound: string;
      fullName: string;
      email: string;
      phone: string;
      roles: string;
      status: string;
      actions: string;
      edit: string;
      delete: string;
      resetPassword: string;
      toggleStatus: string;
      active: string;
      inactive: string;
      banned: string;
      all: string;
    };
    categories: {
      categoryManagement: string;
      manageCategories: string;
      addCategory: string;
      searchCategories: string;
      categoryName: string;
      description: string;
      parentCategory: string;
      noParent: string;
      loadingCategories: string;
      noCategoriesFound: string;
    };
    brands: {
      brandManagement: string;
      manageBrands: string;
      addBrand: string;
      searchBrands: string;
      brandName: string;
      loadingBrands: string;
      noBrandsFound: string;
    };
    attributes: {
      title: string;
      description: string;
      attributeManagement: string;
      manageAttributes: string;
      addAttribute: string;
      searchAttributes: string;
      attributeName: string;
      loadingAttributes: string;
      noAttributes: string;
      deleteConfirmTitle: string;
      deleteConfirmMessage: string;
    };
    profile: {
      profile: string;
      editProfile: string;
      personalInformation: string;
      accountSettings: string;
    };
    dialogs: {
      deleteUser: string;
      deleteUserConfirm: string;
      deleteUserWarning: string;
      deleteCategory: string;
      deleteCategoryConfirm: string;
      deleteBrand: string;
      deleteBrandConfirm: string;
      resetPassword: string;
      resetPasswordForUser: string;
      newPassword: string;
      enterNewPassword: string;
      toggleStatus: string;
      toggleStatusConfirm: string;
      lockAccount?: string;
      unlockAccount?: string;
      lockAccountConfirm?: string;
      unlockAccountConfirm?: string;
      accountLockedWarning?: string;
      accountUnlockedInfo?: string;
      cancel: string;
      confirm: string;
    };
    forms: {
      user: {
        addNewUser: string;
        editUser: string;
        updateUserInfo: string;
        createNewUser: string;
        profile: string;
        history: string;
        fullName: string;
        enterFullName: string;
        email: string;
        emailCannotChange: string;
        enterEmail: string;
        changeEmail: string;
        changeUserEmail: string;
        password: string;
        leaveEmptyToKeepPassword: string;
        enterNewPassword: string;
        phoneNumber: string;
        enterPhoneNumber: string;
        roles: string;
        loadingRoles: string;
        noRolesAvailable: string;
        status: string;
        active: string;
        inactive: string;
        avatar: string;
        createUserSuccess: string;
        updateUserSuccess: string;
        cannotUploadImage: string;
        errorOccurred: string;
        cannotDeleteOldImage: string;
        cannotDeleteNewImage: string;
      };
      category: {
        addNewCategory: string;
        editCategory: string;
        updateCategoryInfo: string;
        createNewCategory: string;
        categoryImage: string;
        uploadCategoryImage: string;
        parentCategory: string;
        selectParentCategory: string;
        noParent: string;
        searchParentCategory: string;
        categoryName: string;
        enterCategoryName: string;
        slug: string;
        slugAutoGenerated: string;
        slugManuallyEdited: string;
        regenerateSlug: string;
        description: string;
        enterDescription: string;
        displayOrder: string;
        enterDisplayOrder: string;
        status: string;
        active: string;
        inactive: string;
        createCategorySuccess: string;
        updateCategorySuccess: string;
      };
      brand: {
        addNewBrand: string;
        editBrand: string;
        updateBrandInfo: string;
        createNewBrand: string;
        brandLogo: string;
        uploadBrandLogo: string;
        brandName: string;
        enterBrandName: string;
        slug: string;
        slugAutoGenerated: string;
        slugManuallyEdited: string;
        editSlug: string;
        disableSlugEdit: string;
        onlySuperAdminCanEditSlug: string;
        enterSlug: string;
        country: string;
        enterCountry: string;
        website: string;
        enterWebsite: string;
        description: string;
        enterDescription: string;
        displayOrder: string;
        enterDisplayOrder: string;
        status: string;
        active: string;
        inactive: string;
        invalidFile: string;
        createBrandSuccess: string;
        updateBrandSuccess: string;
      };
      attribute: {
        addNewAttribute: string;
        editAttribute: string;
        updateAttributeInfo: string;
        createNewAttribute: string;
        basicInfo: string;
        domainLabel: string;
        domainDescription: string;
        perfumeTab: string;
        cosmeticsTab: string;
        attributeNamePlaceholder: string;
        attributeNameDescription: string;
        attributeTypeDescription: string;
        unitLabel: string;
        unitDescription: string;
        variantSpecificLabel: string;
        variantSpecificDescription: string;
        valuesTitle: string;
        noValues: string;
        addValue: string;
        valuePlaceholder: string;
        defaultLabel: string;
        createAttributeSuccess: string;
        updateAttributeSuccess: string;
      };
      concentration: {
        addNewConcentration: string;
        editConcentration: string;
        updateConcentrationInfo: string;
        createNewConcentration: string;
        nameLabel: string;
        nameDescription: string;
        namePlaceholder: string;
        slugLabel: string;
        slugDescription: string;
        slugPlaceholder: string;
        descriptionLabel: string;
        descriptionPlaceholder: string;
        uiGroupTitle: string;
        acronymLabel: string;
        acronymDescription: string;
        technicalGroupTitle: string;
        minOilLabel: string;
        minOilDescription: string;
        maxOilLabel: string;
        maxOilDescription: string;
        longevityLabel: string;
        longevityDescription: string;
        intensityLabel: string;
        intensityDescription: string;
        displayOrderLabel: string;
        displayOrderDescription: string;
        statusLabel: string;
        createConcentrationSuccess: string;
        updateConcentrationSuccess: string;
      };
      common: {
        save: string;
        cancel: string;
        close: string;
        loading: string;
        submitting: string;
      };
    };
  };
}

export const translations: Record<Locale, Translations> = {
  vi: {
    auth: {
      login: {
        credentialsFilled: "Đã điền thông tin đăng nhập",
        emailFilled: "Đã điền email",
        failedToLoadCredentials: "Không thể tải thông tin đăng nhập đã lưu",
        signedInSuccessfully: "Đăng nhập thành công",
        pleaseCompleteSecurityVerification:
          "Vui lòng hoàn thành xác minh bảo mật",
        securityVerificationFailed:
          "Xác minh bảo mật thất bại. Vui lòng thử lại.",
        cannotVerifySecurity: "Không thể xác minh bảo mật. Vui lòng thử lại.",
        connectionTimeout: "Kết nối quá hạn, vui lòng kiểm tra mạng",
        emailOrPasswordIncorrect: "Email hoặc mật khẩu không đúng",
        welcomeBack: "Chào mừng trở lại",
        enterDetailsToSignIn: "Vui lòng nhập thông tin để đăng nhập",
        email: "Email",
        password: "Mật khẩu",
        forgotPassword: "Quên mật khẩu?",
        rememberMe: "Ghi nhớ đăng nhập trong 7 ngày",
        signIn: "Đăng nhập",
        dontHaveAccount: "Chưa có tài khoản?",
        contactAdmin: "Liên hệ Admin",
        quickLogin: "Đăng nhập nhanh",
        saved: "Đã lưu",
        noSavedAccounts:
          "Chưa có tài khoản đã lưu. Các lần đăng nhập gần đây sẽ hiển thị ở đây.",
        recentLoginsWillAppear: "Các lần đăng nhập gần đây sẽ hiển thị ở đây",
        lastLogin: "Lần đăng nhập cuối:",
        securityVerification: "Xác minh bảo mật",
        developmentMode: "(Chế độ Development)",
        securityVerificationOptional:
          "Xác minh bảo mật (không bắt buộc trong development)",
        pleaseCompleteSecurityVerificationToLogin:
          "Vui lòng hoàn thành xác minh bảo mật để đăng nhập",
      },
      forgotPassword: {
        resetYourPassword: "Đặt lại mật khẩu",
        enterEmailToReset:
          "Nhập địa chỉ email của bạn và chúng tôi sẽ gửi mã xác minh để đặt lại mật khẩu một cách an toàn.",
        forgotYourPassword: "Quên mật khẩu?",
        enterEmailAndWeWillSendOtp:
          "Nhập địa chỉ email của bạn và chúng tôi sẽ gửi mã OTP 6 chữ số để đặt lại mật khẩu.",
        emailAddress: "Địa chỉ email",
        sendOtpCode: "Gửi mã OTP",
        backToLogin: "Quay lại đăng nhập",
        checkYourEmail: "Kiểm tra email của bạn",
        weSentVerificationCode:
          "Chúng tôi đã gửi mã xác minh cho bạn. Vui lòng kiểm tra hộp thư và nhập mã để tiếp tục.",
        otpCodeSentTo: "Chúng tôi đã gửi mã OTP 6 chữ số đến",
        whatsNext: "Bước tiếp theo?",
        checkInboxForOtp: "Kiểm tra hộp thư của bạn để lấy mã OTP",
        enterSixDigitCode: "Nhập mã 6 chữ số để xác minh danh tính của bạn",
        otpCodeExpiresIn5Minutes: "Mã OTP sẽ hết hạn sau 5 phút",
        continueToVerifyOtp: "Tiếp tục xác minh OTP",
        sendToDifferentEmail: "Gửi đến email khác",
        otpCodeSent: "Mã OTP đã được gửi đến email của bạn",
      },
      verifyOtp: {
        verifyOtpCode: "Xác minh mã OTP",
        enterSixDigitCodeSentTo: "Nhập mã 6 chữ số đã được gửi đến",
        otpCode: "Mã OTP",
        verifyOtp: "Xác minh OTP",
        resendOtp: "Gửi lại mã OTP",
        resending: "Đang gửi lại...",
        backToLogin: "Quay lại đăng nhập",
        emailRequired: "Email là bắt buộc",
        otpVerifiedSuccessfully: "Xác minh OTP thành công",
        invalidOtpCode: "Mã OTP không hợp lệ. Vui lòng thử lại.",
        otpCodeResentSuccessfully: "Đã gửi lại mã OTP thành công",
        failedToResendOtp: "Không thể gửi lại mã OTP. Vui lòng thử lại.",
        otpVerified: "OTP đã được xác minh",
        yourOtpHasBeenVerified: "Mã OTP của bạn đã được xác minh thành công.",
        redirectingToResetPassword:
          "Đang chuyển hướng đến trang đặt lại mật khẩu...",
        verifyYourIdentity: "Xác minh danh tính",
        enterSixDigitCodeToVerify:
          "Nhập mã 6 chữ số chúng tôi đã gửi đến địa chỉ email của bạn để xác minh danh tính và tiếp tục đặt lại mật khẩu.",
      },
      resetPassword: {
        invalidOrMissingEmailOtp: "Email hoặc mã OTP không hợp lệ hoặc thiếu",
        otpExpired: "Mã OTP đã hết hạn",
        yourOtpExpiredOrInvalid:
          "Mã OTP của bạn đã hết hạn hoặc không hợp lệ. Vui lòng yêu cầu mã mới.",
        requestNewOtp: "Yêu cầu mã OTP mới",
        passwordResetSuccessfully: "Đặt lại mật khẩu thành công",
        failedToResetPassword: "Không thể đặt lại mật khẩu. Vui lòng thử lại.",
        passwordResetFailed: "Đặt lại mật khẩu thất bại",
        createYourNewPassword: "Tạo mật khẩu mới",
        enterNewPasswordBelow:
          "Nhập mật khẩu mới của bạn bên dưới. Đảm bảo mật khẩu mạnh và an toàn để bảo vệ tài khoản của bạn.",
        enterNewPasswordAtLeast:
          "Nhập mật khẩu mới của bạn bên dưới. Mật khẩu phải có ít nhất 6 ký tự.",
        newPassword: "Mật khẩu mới",
        confirmPassword: "Xác nhận mật khẩu",
        resetPassword: "Đặt lại mật khẩu",
      },
      common: {
        error: "Lỗi",
        success: "Thành công",
        loading: "Đang tải...",
        pleaseTryAgain: "Vui lòng thử lại",
      },
    },
    // Admin Dashboard
    admin: {
      menu: {
        dashboard: "Bảng điều khiển",
        brands: "Thương hiệu",
        categories: "Danh mục",
        concentrations: "Nồng độ",
        attributes: "Thuộc tính",
        warehouses: "Kho hàng",
        users: "Người dùng",
      },
      layout: {
        storeAdmin: "Quản trị cửa hàng",
        orchard: "ORCHARD",
        adminConsole: "Bảng điều khiển Admin",
        expandSidebar: "Mở rộng thanh bên",
        collapseSidebar: "Thu gọn thanh bên",
        help: "Trợ giúp",
        notifications: "Thông báo",
        account: "Tài khoản",
        profile: "Hồ sơ",
        billing: "Thanh toán",
        settings: "Cài đặt",
        logOut: "Đăng xuất",
        adminUser: "Người dùng Admin",
        language: "Ngôn ngữ",
        vietnamese: "Tiếng Việt",
        english: "Tiếng Anh",
      },
      dashboard: {
        totalRevenue: "Tổng doanh thu",
        totalOrders: "Tổng đơn hàng",
        newCustomers: "Khách hàng mới",
        lowStock: "Hàng tồn kho thấp",
        vsLastMonth: "so với tháng trước",
        recentOrders: "Đơn hàng gần đây",
        topProducts: "Sản phẩm bán chạy",
        orderId: "Mã đơn hàng",
        customer: "Khách hàng",
        product: "Sản phẩm",
        amount: "Số tiền",
        status: "Trạng thái",
        date: "Ngày",
        productName: "Tên sản phẩm",
        sales: "Doanh số",
        quantity: "Số lượng",
        revenueOverTime: "Doanh thu theo thời gian",
        last7Days: "7 ngày qua",
        topSellingProducts: "Sản phẩm bán chạy",
        thisWeek: "Tuần này",
        viewAll: "Xem tất cả",
      },
      common: {
        search: "Tìm kiếm",
        filter: "Lọc",
        export: "Xuất",
        import: "Nhập",
        addNew: "Thêm mới",
        edit: "Chỉnh sửa",
        delete: "Xóa",
        save: "Lưu",
        cancel: "Hủy",
        confirm: "Xác nhận",
        actions: "Thao tác",
        noData: "Không có dữ liệu",
        loading: "Đang tải...",
        error: "Lỗi",
        success: "Thành công",
        name: "Tên",
        email: "Email",
        phone: "Số điện thoại",
        address: "Địa chỉ",
        createdAt: "Ngày tạo",
        updatedAt: "Ngày cập nhật",
      },
      users: {
        userManagement: "Quản lý người dùng",
        manageAllStaffMembers:
          "Quản lý tất cả nhân viên và vai trò của họ trong hệ thống.",
        addUser: "Thêm người dùng",
        searchByNameEmailPhone:
          "Tìm kiếm theo tên, email hoặc số điện thoại...",
        display: "Hiển thị",
        rowsPerPage: "dòng / trang",
        loadingUsers: "Đang tải người dùng...",
        noUsersFound: "Không tìm thấy người dùng",
        fullName: "Họ và tên",
        email: "Email",
        phone: "Số điện thoại",
        roles: "Vai trò",
        status: "Trạng thái",
        actions: "Thao tác",
        edit: "Chỉnh sửa",
        delete: "Xóa",
        resetPassword: "Đặt lại mật khẩu",
        toggleStatus: "Thay đổi trạng thái",
        active: "Hoạt động",
        inactive: "Không hoạt động",
        banned: "Bị cấm",
        all: "Tất cả",
      },
      categories: {
        categoryManagement: "Quản lý danh mục",
        manageCategories: "Quản lý tất cả danh mục sản phẩm trong hệ thống.",
        addCategory: "Thêm danh mục",
        searchCategories: "Tìm kiếm danh mục...",
        categoryName: "Tên danh mục",
        description: "Mô tả",
        parentCategory: "Danh mục cha",
        noParent: "Không có",
        loadingCategories: "Đang tải danh mục...",
        noCategoriesFound: "Không tìm thấy danh mục",
      },
      brands: {
        brandManagement: "Quản lý thương hiệu",
        manageBrands: "Quản lý tất cả thương hiệu sản phẩm trong hệ thống.",
        addBrand: "Thêm thương hiệu",
        searchBrands: "Tìm kiếm thương hiệu...",
        brandName: "Tên thương hiệu",
        loadingBrands: "Đang tải thương hiệu...",
        noBrandsFound: "Không tìm thấy thương hiệu",
      },
      attributes: {
        title: "Quản lý thuộc tính",
        description: "Quản lý tất cả thuộc tính sản phẩm trong hệ thống.",
        attributeManagement: "Quản lý thuộc tính",
        manageAttributes: "Quản lý tất cả thuộc tính sản phẩm trong hệ thống.",
        addAttribute: "Thêm thuộc tính",
        searchAttributes: "Tìm kiếm thuộc tính...",
        attributeName: "Tên thuộc tính",
        loadingAttributes: "Đang tải thuộc tính...",
        noAttributes: "Không tìm thấy thuộc tính",
        deleteConfirmTitle: "Xóa thuộc tính",
        deleteConfirmMessage:
          "Bạn có chắc chắn muốn xóa thuộc tính '{name}'? Hành động này không thể hoàn tác.",
      },
      profile: {
        profile: "Hồ sơ",
        editProfile: "Chỉnh sửa hồ sơ",
        personalInformation: "Thông tin cá nhân",
        accountSettings: "Cài đặt tài khoản",
      },
      dialogs: {
        deleteUser: "Xóa người dùng",
        deleteUserConfirm: "Bạn có chắc chắn muốn xóa người dùng này?",
        deleteUserWarning: "Hành động này không thể hoàn tác.",
        deleteCategory: "Xóa danh mục",
        deleteCategoryConfirm: "Bạn có chắc chắn muốn xóa danh mục này?",
        deleteBrand: "Xóa thương hiệu",
        deleteBrandConfirm: "Bạn có chắc chắn muốn xóa thương hiệu này?",
        resetPassword: "Đặt lại mật khẩu",
        resetPasswordForUser: "Nhập mật khẩu mới cho user",
        newPassword: "Mật khẩu mới",
        enterNewPassword: "Nhập mật khẩu mới (tối thiểu 6 ký tự)",
        toggleStatus: "Thay đổi trạng thái",
        toggleStatusConfirm: "Bạn có chắc chắn muốn thay đổi trạng thái?",
        cancel: "Hủy",
        confirm: "Xác nhận",
      },
      forms: {
        user: {
          addNewUser: "Thêm người dùng mới",
          editUser: "Chỉnh sửa người dùng",
          updateUserInfo: "Cập nhật thông tin người dùng và vai trò.",
          createNewUser:
            "Tạo tài khoản người dùng mới với vai trò và quyền hạn.",
          profile: "Thông tin",
          history: "Lịch sử",
          fullName: "Họ và tên",
          enterFullName: "Nhập họ và tên",
          email: "Email",
          emailCannotChange: "Email không thể thay đổi",
          enterEmail: "Nhập địa chỉ email",
          changeEmail: "Đổi email",
          changeUserEmail: "Đổi email người dùng",
          password: "Mật khẩu",
          leaveEmptyToKeepPassword:
            "Để trống nếu bạn không muốn thay đổi mật khẩu",
          enterNewPassword: "Nhập mật khẩu mới (tùy chọn)",
          phoneNumber: "Số điện thoại",
          enterPhoneNumber: "Nhập số điện thoại",
          roles: "Vai trò",
          loadingRoles: "Đang tải vai trò...",
          noRolesAvailable: "Không có vai trò nào",
          status: "Trạng thái",
          active: "Hoạt động",
          inactive: "Không hoạt động",
          avatar: "Ảnh đại diện",
          createUserSuccess: "Tạo người dùng thành công",
          updateUserSuccess: "Cập nhật người dùng thành công",
          cannotUploadImage: "Không thể upload ảnh",
          errorOccurred: "Có lỗi xảy ra khi xử lý",
          cannotDeleteOldImage: "Không thể xóa ảnh cũ",
          cannotDeleteNewImage: "Không thể xóa ảnh mới sau khi lỗi",
        },
        category: {
          addNewCategory: "Thêm danh mục mới",
          editCategory: "Chỉnh sửa danh mục",
          updateCategoryInfo:
            "Cập nhật thông tin danh mục. Slug sẽ tự động tạo từ tên.",
          createNewCategory:
            "Thêm danh mục mới vào hệ thống. Slug sẽ tự động tạo từ tên nếu bạn không nhập.",
          categoryImage: "Hình ảnh danh mục",
          uploadCategoryImage:
            "Upload hình ảnh danh mục (khuyến nghị 300x300px). Thư mục",
          parentCategory: "Danh mục cha",
          selectParentCategory:
            "Chọn danh mục cha (để trống nếu là danh mục gốc)",
          noParent: "Không có (danh mục gốc)",
          searchParentCategory: "Tìm kiếm danh mục cha...",
          categoryName: "Tên danh mục",
          enterCategoryName: "Nhập tên danh mục",
          slug: "Slug",
          slugAutoGenerated:
            "Slug tự động tạo từ tên. Click 'Tạo lại' để tạo lại slug.",
          slugManuallyEdited:
            "Bạn đang chỉnh sửa slug thủ công. Slug này sẽ được sử dụng trong URL.",
          regenerateSlug: "Tạo lại",
          description: "Mô tả",
          enterDescription: "Nhập mô tả danh mục...",
          displayOrder: "Thứ tự hiển thị",
          enterDisplayOrder:
            "Nhập thứ tự hiển thị (số nhỏ hơn sẽ hiển thị trước)",
          status: "Trạng thái",
          active: "Hoạt động",
          inactive: "Không hoạt động",
          createCategorySuccess: "Tạo danh mục thành công!",
          updateCategorySuccess: "Cập nhật danh mục thành công!",
        },
        brand: {
          addNewBrand: "Thêm thương hiệu mới",
          editBrand: "Chỉnh sửa thương hiệu",
          updateBrandInfo:
            "Cập nhật thông tin thương hiệu. Slug sẽ tự động tạo từ tên nếu bạn thay đổi tên.",
          createNewBrand:
            "Thêm thương hiệu mới vào hệ thống. Slug sẽ tự động tạo từ tên nếu bạn không nhập.",
          brandLogo: "Logo thương hiệu",
          uploadBrandLogo:
            "Upload logo thương hiệu (hình vuông hoặc chữ nhật, khuyến nghị 200x200px hoặc 300x150px)",
          brandName: "Tên thương hiệu",
          enterBrandName: "Ví dụ: Dior Paris",
          slug: "Slug",
          slugAutoGenerated:
            "Slug tự động tạo từ tên. Click 'Chỉnh sửa' để tùy chỉnh.",
          slugManuallyEdited:
            "Bạn đang chỉnh sửa slug thủ công. Slug này sẽ được sử dụng trong URL.",
          editSlug: "Chỉnh sửa",
          disableSlugEdit: "Tắt chỉnh sửa slug",
          onlySuperAdminCanEditSlug: "Chỉ Super Admin mới có thể chỉnh slug",
          enterSlug: "dior-paris",
          country: "Quốc gia",
          enterCountry: "Ví dụ: France",
          website: "Website",
          enterWebsite: "https://example.com",
          description: "Mô tả",
          enterDescription: "Mô tả về thương hiệu...",
          displayOrder: "Thứ tự hiển thị",
          enterDisplayOrder:
            "Nhập thứ tự hiển thị (số nhỏ hơn sẽ hiển thị trước)",
          status: "Trạng thái",
          active: "Hoạt động",
          inactive: "Không hoạt động",
          invalidFile: "File không hợp lệ",
          createBrandSuccess: "Tạo thương hiệu thành công!",
          updateBrandSuccess: "Cập nhật thương hiệu thành công!",
        },
        attribute: {
          addNewAttribute: "Thêm thuộc tính sản phẩm",
          editAttribute: "Chỉnh sửa thuộc tính sản phẩm",
          updateAttributeInfo: "Điều chỉnh thông tin của thuộc tính sản phẩm.",
          createNewAttribute:
            "Điền các thông tin bên dưới để tạo ra một thuộc tính sản phẩm dễ hiểu và có thể tái sử dụng.",
          basicInfo: "Thông tin hiển thị",
          domainLabel: "Thuộc nhóm sản phẩm",
          domainDescription:
            "Chọn nhóm sản phẩm mà thuộc tính này áp dụng. Ví dụ: Thuộc tính mô tả mùi hương nước hoa hay đặc tính của mỹ phẩm.",
          perfumeTab: "Nước hoa",
          cosmeticsTab: "Mỹ phẩm",
          attributeNamePlaceholder: "Ví dụ: Màu sắc, Dung tích, Nhóm hương",
          attributeNameDescription:
            "Tên mà Admin và khách hàng sẽ nhìn thấy, ví dụ: Màu sắc, Dung tích, Nhóm hương, Loại da, Vấn đề da...",
          attributeTypeLabel: "Kiểu dữ liệu thuộc tính",
          attributeTypeDescription:
            "Chọn cách người dùng nhập hoặc chọn giá trị: một lựa chọn (Select), nhiều lựa chọn (Multi-Select), dạng Bật/Tắt (Boolean) hoặc văn bản tự do (Text).",
          unitLabel: "Đơn vị hiển thị (nếu có)",
          unitDescription:
            "Chỉ nhập khi thuộc tính có đơn vị đo lường, ví dụ: ml, g, %, giờ... Đơn vị sẽ được hiển thị bên cạnh giá trị (ví dụ: 50 ml, 8 giờ).",
          variantSpecificLabel: "Dùng để tạo biến thể sản phẩm",
          variantSpecificDescription:
            "Bật khi thuộc tính này dùng để phân tách các biến thể khác nhau của cùng một sản phẩm (ví dụ: Dung tích 50ml, 100ml). Chỉ nên dùng với loại SELECT.",
          valuesTitle: "Danh sách giá trị có thể chọn",
          noValues:
            'Chưa có giá trị nào. Nhấn "Thêm giá trị" và nhập các lựa chọn mà Admin có thể chọn cho thuộc tính này (ví dụ: Đỏ, Xanh, 50ml, 100ml).',
          addValue: "Thêm giá trị mới",
          valuePlaceholder: "Ví dụ: Đỏ, Xanh, 50ml, 8 giờ",
          defaultLabel: "Giá trị mặc định",
          createAttributeSuccess: "Tạo thuộc tính thành công!",
          updateAttributeSuccess: "Cập nhật thuộc tính thành công!",
        },
        concentration: {
          addNewConcentration: "Thêm nồng độ mới",
          editConcentration: "Chỉnh sửa nồng độ",
          updateConcentrationInfo: "Cập nhật thông tin nồng độ nước hoa.",
          createNewConcentration: "Điền thông tin để tạo nồng độ nước hoa mới.",
          nameLabel: "Tên nồng độ",
          nameDescription: "Tên hiển thị của nồng độ nước hoa",
          namePlaceholder: "Ví dụ: Eau de Parfum",
          slugLabel: "Slug",
          slugDescription: "Mã định danh URL (tự động tạo từ tên nếu để trống)",
          slugPlaceholder: "eau-de-parfum",
          descriptionLabel: "Mô tả",
          descriptionPlaceholder: "Nhập mô tả...",
          uiGroupTitle: "Hiển thị & Giao diện",
          acronymLabel: "Tên viết tắt",
          acronymDescription:
            "Mã hiển thị ngắn gọn (ví dụ: EDP, EDT, EDC) - Tự động tạo từ tên nếu để trống",
          technicalGroupTitle: "Thông số kỹ thuật",
          minOilLabel: "Tỷ lệ tinh dầu tối thiểu (%)",
          minOilDescription: "Tỷ lệ tinh dầu tối thiểu (0-100%)",
          maxOilLabel: "Tỷ lệ tinh dầu tối đa (%)",
          maxOilDescription: "Tỷ lệ tinh dầu tối đa (0-100%)",
          longevityLabel: "Độ lưu hương (giờ)",
          longevityDescription:
            "Thời gian lưu hương trung bình (ví dụ: 6-8 giờ)",
          intensityLabel: "Độ đậm đặc / Cường độ",
          intensityDescription:
            "Gợi ý cường độ mùi (nhẹ, vừa, mạnh) để hiển thị cho khách hàng",
          displayOrderLabel: "Thứ tự hiển thị",
          displayOrderDescription:
            "Số thứ tự để sắp xếp nồng độ trong danh sách",
          statusLabel: "Trạng thái",
          createConcentrationSuccess: "Tạo nồng độ thành công!",
          updateConcentrationSuccess: "Cập nhật nồng độ thành công!",
        },
        common: {
          save: "Lưu",
          cancel: "Hủy",
          close: "Đóng",
          loading: "Đang xử lý...",
          submitting: "Đang gửi...",
        },
      },
    },
  },
  en: {
    auth: {
      login: {
        credentialsFilled: "Login credentials filled",
        emailFilled: "Email filled",
        failedToLoadCredentials: "Failed to load saved credentials",
        signedInSuccessfully: "Signed in successfully",
        pleaseCompleteSecurityVerification:
          "Please complete security verification",
        securityVerificationFailed:
          "Security verification failed. Please try again.",
        cannotVerifySecurity: "Cannot verify security. Please try again.",
        connectionTimeout: "Connection timeout, please check your network",
        emailOrPasswordIncorrect: "Email or password is incorrect",
        welcomeBack: "Welcome back",
        enterDetailsToSignIn: "Please enter your details to sign in",
        email: "Email",
        password: "Password",
        forgotPassword: "Forgot password?",
        rememberMe: "Remember me for 7 days",
        signIn: "Sign in",
        dontHaveAccount: "Don't have an account?",
        contactAdmin: "Contact Admin",
        quickLogin: "Quick login",
        saved: "Saved",
        noSavedAccounts:
          "No saved accounts yet. Your recent logins will appear here.",
        recentLoginsWillAppear: "Your recent logins will appear here",
        lastLogin: "Last login:",
        securityVerification: "Security Verification",
        developmentMode: "(Development Mode)",
        securityVerificationOptional:
          "Security verification (optional in development)",
        pleaseCompleteSecurityVerificationToLogin:
          "Please complete security verification to login",
      },
      forgotPassword: {
        resetYourPassword: "Reset your password",
        enterEmailToReset:
          "Enter your email address and we'll send you a verification code to reset your password securely.",
        forgotYourPassword: "Forgot your password?",
        enterEmailAndWeWillSendOtp:
          "Enter your email address and we'll send you a 6-digit OTP code to reset your password.",
        emailAddress: "Email address",
        sendOtpCode: "Send OTP code",
        backToLogin: "Back to login",
        checkYourEmail: "Check your email",
        weSentVerificationCode:
          "We've sent you a verification code. Please check your inbox and enter the code to continue.",
        otpCodeSentTo: "We've sent a 6-digit OTP code to",
        whatsNext: "What's next?",
        checkInboxForOtp: "Check your inbox for the OTP code",
        enterSixDigitCode: "Enter the 6-digit code to verify your identity",
        otpCodeExpiresIn5Minutes: "The OTP code will expire in 5 minutes",
        continueToVerifyOtp: "Continue to verify OTP",
        sendToDifferentEmail: "Send to a different email",
        otpCodeSent: "OTP code sent to your email",
      },
      verifyOtp: {
        verifyOtpCode: "Verify OTP Code",
        enterSixDigitCodeSentTo: "Enter the 6-digit code sent to",
        otpCode: "OTP Code",
        verifyOtp: "Verify OTP",
        resendOtp: "Resend OTP",
        resending: "Resending...",
        backToLogin: "Back to login",
        emailRequired: "Email is required",
        otpVerifiedSuccessfully: "OTP verified successfully",
        invalidOtpCode: "Invalid OTP code. Please try again.",
        otpCodeResentSuccessfully: "OTP code resent successfully",
        failedToResendOtp: "Failed to resend OTP. Please try again.",
        otpVerified: "OTP Verified",
        yourOtpHasBeenVerified: "Your OTP has been verified successfully.",
        redirectingToResetPassword: "Redirecting to reset password...",
        verifyYourIdentity: "Verify your identity",
        enterSixDigitCodeToVerify:
          "Enter the 6-digit code we sent to your email address to verify your identity and continue with password reset.",
      },
      resetPassword: {
        invalidOrMissingEmailOtp: "Invalid or missing email/OTP",
        otpExpired: "OTP expired",
        yourOtpExpiredOrInvalid:
          "Your OTP code has expired or is invalid. Please request a new one.",
        requestNewOtp: "Request New OTP",
        passwordResetSuccessfully: "Password reset successfully",
        failedToResetPassword: "Failed to reset password. Please try again.",
        passwordResetFailed: "Password reset failed",
        createYourNewPassword: "Create your new password",
        enterNewPasswordBelow:
          "Enter your new password below. Make sure it's strong and secure to protect your account.",
        enterNewPasswordAtLeast:
          "Enter your new password below. Make sure it's at least 6 characters long.",
        newPassword: "New Password",
        confirmPassword: "Confirm Password",
        resetPassword: "Reset Password",
      },
      common: {
        error: "Error",
        success: "Success",
        loading: "Loading...",
        pleaseTryAgain: "Please try again",
      },
    },
    // Admin Dashboard
    admin: {
      menu: {
        dashboard: "Dashboard",
        brands: "Brands",
        categories: "Categories",
        concentrations: "Concentrations",
        attributes: "Attributes",
        warehouses: "Warehouses",
        users: "Users",
      },
      layout: {
        storeAdmin: "Store Admin",
        orchard: "ORCHARD",
        adminConsole: "Admin Console",
        expandSidebar: "Expand sidebar",
        collapseSidebar: "Collapse sidebar",
        help: "Help",
        notifications: "Notifications",
        account: "Account",
        profile: "Profile",
        billing: "Billing",
        settings: "Settings",
        logOut: "Log out",
        adminUser: "Admin User",
        language: "Language",
        vietnamese: "Vietnamese",
        english: "English",
      },
      dashboard: {
        totalRevenue: "Total Revenue",
        totalOrders: "Total Orders",
        newCustomers: "New Customers",
        lowStock: "Low Stock",
        vsLastMonth: "vs last month",
        recentOrders: "Recent Orders",
        topProducts: "Top Products",
        orderId: "Order ID",
        customer: "Customer",
        product: "Product",
        amount: "Amount",
        status: "Status",
        date: "Date",
        productName: "Product Name",
        sales: "Sales",
        quantity: "Quantity",
        revenueOverTime: "Revenue Over Time",
        last7Days: "Last 7 days",
        topSellingProducts: "Top Selling Products",
        thisWeek: "This week",
        viewAll: "View all",
      },
      common: {
        search: "Search",
        filter: "Filter",
        export: "Export",
        import: "Import",
        addNew: "Add New",
        edit: "Edit",
        delete: "Delete",
        save: "Save",
        cancel: "Cancel",
        confirm: "Confirm",
        actions: "Actions",
        noData: "No data",
        loading: "Loading...",
        error: "Error",
        success: "Success",
        name: "Name",
        email: "Email",
        phone: "Phone",
        address: "Address",
        createdAt: "Created At",
        updatedAt: "Updated At",
      },
      users: {
        userManagement: "User Management",
        manageAllStaffMembers:
          "Manage all staff members and their roles in the system.",
        addUser: "Add User",
        searchByNameEmailPhone: "Search by name, email, or phone...",
        display: "Display",
        rowsPerPage: "rows / page",
        loadingUsers: "Loading users...",
        noUsersFound: "No users found",
        fullName: "Full Name",
        email: "Email",
        phone: "Phone",
        roles: "Roles",
        status: "Status",
        actions: "Actions",
        edit: "Edit",
        delete: "Delete",
        resetPassword: "Reset Password",
        toggleStatus: "Toggle Status",
        active: "Active",
        inactive: "Inactive",
        banned: "Banned",
        all: "All",
      },
      categories: {
        categoryManagement: "Category Management",
        manageCategories: "Manage all product categories in the system.",
        addCategory: "Add Category",
        searchCategories: "Search categories...",
        categoryName: "Category Name",
        description: "Description",
        parentCategory: "Parent Category",
        noParent: "None",
        loadingCategories: "Loading categories...",
        noCategoriesFound: "No categories found",
      },
      brands: {
        brandManagement: "Brand Management",
        manageBrands: "Manage all product brands in the system.",
        addBrand: "Add Brand",
        searchBrands: "Search brands...",
        brandName: "Brand Name",
        loadingBrands: "Loading brands...",
        noBrandsFound: "No brands found",
      },
      attributes: {
        title: "Attribute Management",
        description: "Manage all product attributes in the system.",
        attributeManagement: "Attribute Management",
        manageAttributes: "Manage all product attributes in the system.",
        addAttribute: "Add Attribute",
        searchAttributes: "Search attributes...",
        attributeName: "Attribute Name",
        loadingAttributes: "Loading attributes...",
        noAttributes: "No attributes found",
        deleteConfirmTitle: "Delete Attribute",
        deleteConfirmMessage:
          "Are you sure you want to delete attribute '{name}'? This action cannot be undone.",
      },
      profile: {
        profile: "Profile",
        editProfile: "Edit Profile",
        personalInformation: "Personal Information",
        accountSettings: "Account Settings",
      },
      dialogs: {
        deleteUser: "Delete User",
        deleteUserConfirm: "Are you sure you want to delete this user?",
        deleteUserWarning: "This action cannot be undone.",
        deleteCategory: "Delete Category",
        deleteCategoryConfirm: "Are you sure you want to delete this category?",
        deleteBrand: "Delete Brand",
        deleteBrandConfirm: "Are you sure you want to delete this brand?",
        resetPassword: "Reset Password",
        resetPasswordForUser: "Enter new password for user",
        newPassword: "New Password",
        enterNewPassword: "Enter new password (minimum 6 characters)",
        toggleStatus: "Toggle Status",
        toggleStatusConfirm: "Are you sure you want to toggle the status?",
        lockAccount: "Lock Account",
        unlockAccount: "Unlock Account",
        lockAccountConfirm: "Are you sure you want to lock the account",
        unlockAccountConfirm: "Are you sure you want to unlock the account",
        accountLockedWarning:
          "Locked accounts will not be able to log in to the system.",
        accountUnlockedInfo: "The account will be reactivated and can log in.",
        cancel: "Cancel",
        confirm: "Confirm",
      },
      forms: {
        user: {
          addNewUser: "Add New User",
          editUser: "Edit User",
          updateUserInfo: "Update user information and roles.",
          createNewUser:
            "Create a new user account with roles and permissions.",
          profile: "Profile",
          history: "History",
          fullName: "Full Name",
          enterFullName: "Enter full name",
          email: "Email",
          emailCannotChange: "Email cannot be changed",
          enterEmail: "Enter email address",
          changeEmail: "Change Email",
          changeUserEmail: "Change user email",
          password: "Password",
          leaveEmptyToKeepPassword:
            "Leave empty if you don't want to change password",
          enterNewPassword: "Enter new password (optional)",
          phoneNumber: "Phone Number",
          enterPhoneNumber: "Enter phone number",
          roles: "Roles",
          loadingRoles: "Loading roles...",
          noRolesAvailable: "No roles available",
          status: "Status",
          active: "Active",
          inactive: "Inactive",
          avatar: "Avatar",
          createUserSuccess: "User created successfully",
          updateUserSuccess: "User updated successfully",
          cannotUploadImage: "Cannot upload image",
          errorOccurred: "An error occurred while processing",
          cannotDeleteOldImage: "Cannot delete old image",
          cannotDeleteNewImage: "Cannot delete new image after error",
        },
        category: {
          addNewCategory: "Add New Category",
          editCategory: "Edit Category",
          updateCategoryInfo:
            "Update category information. Slug will be auto-generated from name.",
          createNewCategory:
            "Add a new category to the system. Slug will be auto-generated from name if you don't enter one.",
          categoryImage: "Category Image",
          uploadCategoryImage:
            "Upload category image (recommended 300x300px). Folder",
          parentCategory: "Parent Category",
          selectParentCategory:
            "Select parent category (leave empty if root category)",
          noParent: "None (root category)",
          searchParentCategory: "Search parent category...",
          categoryName: "Category Name",
          enterCategoryName: "Enter category name",
          slug: "Slug",
          slugAutoGenerated:
            "Slug auto-generated from name. Click 'Regenerate' to regenerate slug.",
          slugManuallyEdited:
            "You are manually editing slug. This slug will be used in URL.",
          regenerateSlug: "Regenerate",
          description: "Description",
          enterDescription: "Enter category description...",
          displayOrder: "Display Order",
          enterDisplayOrder:
            "Enter display order (smaller numbers appear first)",
          status: "Status",
          active: "Active",
          inactive: "Inactive",
          createCategorySuccess: "Category created successfully!",
          updateCategorySuccess: "Category updated successfully!",
        },
        brand: {
          addNewBrand: "Add New Brand",
          editBrand: "Edit Brand",
          updateBrandInfo:
            "Update brand information. Slug will be auto-generated from name if you change the name.",
          createNewBrand:
            "Add a new brand to the system. Slug will be auto-generated from name if you don't enter one.",
          brandLogo: "Brand Logo",
          uploadBrandLogo:
            "Upload brand logo (square or rectangle, recommended 200x200px or 300x150px)",
          brandName: "Brand Name",
          enterBrandName: "Example: Dior Paris",
          slug: "Slug",
          slugAutoGenerated:
            "Slug auto-generated from name. Click 'Edit' to customize.",
          slugManuallyEdited:
            "You are manually editing slug. This slug will be used in URL.",
          editSlug: "Edit",
          disableSlugEdit: "Disable slug editing",
          onlySuperAdminCanEditSlug: "Only Super Admin can edit slug",
          enterSlug: "dior-paris",
          country: "Country",
          enterCountry: "Example: France",
          website: "Website",
          enterWebsite: "https://example.com",
          description: "Description",
          enterDescription: "Brand description...",
          displayOrder: "Display Order",
          enterDisplayOrder:
            "Enter display order (smaller numbers appear first)",
          status: "Status",
          active: "Active",
          inactive: "Inactive",
          invalidFile: "Invalid file",
          createBrandSuccess: "Brand created successfully!",
          updateBrandSuccess: "Brand updated successfully!",
        },
        attribute: {
          addNewAttribute: "Add product attribute",
          editAttribute: "Edit product attribute",
          updateAttributeInfo: "Adjust product attribute information.",
          createNewAttribute:
            "Fill in the fields below to create a clear and reusable product attribute.",
          basicInfo: "Display information",
          domainLabel: "Applies to product group",
          domainDescription:
            "Choose which product group this attribute belongs to. For example, fragrance attributes for Perfume or skin-related attributes for Cosmetics.",
          perfumeTab: "Perfume",
          cosmeticsTab: "Cosmetics",
          attributeNamePlaceholder: "Example: Color, Volume, Fragrance family",
          attributeNameDescription:
            "Name shown to Admin and customers, e.g. Color, Volume, Fragrance family, Skin type, Skin concern...",
          attributeTypeLabel: "Attribute value type",
          attributeTypeDescription:
            "Choose how values are selected: single choice (Select), multiple choice (Multi-Select), On/Off (Boolean), or free text (Text).",
          unitLabel: "Display unit (optional)",
          unitDescription:
            "Only fill in when the attribute has a measurement unit, e.g. ml, g, %, hours... The unit will be shown next to the value (e.g. 50 ml, 8 hours).",
          variantSpecificLabel: "Used for product variants",
          variantSpecificDescription:
            "Enable when this attribute is used to differentiate variants of the same product (e.g. Volume 50ml, 100ml). Should only be used with SELECT type.",
          valuesTitle: "Selectable values",
          noValues:
            'No values yet. Click "Add value" and enter the options Admin can choose for this attribute (e.g. Red, Blue, 50ml, 8 hours).',
          addValue: "Add new value",
          valuePlaceholder: "Example: Red, Blue, 50ml, 8 hours",
          defaultLabel: "Default value",
          createAttributeSuccess: "Attribute created successfully!",
          updateAttributeSuccess: "Attribute updated successfully!",
        },
        concentration: {
          addNewConcentration: "Add new concentration",
          editConcentration: "Edit concentration",
          updateConcentrationInfo: "Update perfume concentration information.",
          createNewConcentration:
            "Fill in the information to create a new perfume concentration.",
          nameLabel: "Concentration name",
          nameDescription: "Display name of the perfume concentration",
          namePlaceholder: "Example: Eau de Parfum",
          slugLabel: "Slug",
          slugDescription:
            "URL identifier (auto generated from name if left blank)",
          slugPlaceholder: "eau-de-parfum",
          descriptionLabel: "Description",
          descriptionPlaceholder: "Enter description...",
          uiGroupTitle: "Display & UI",
          acronymLabel: "Short code",
          acronymDescription:
            "Short display code (e.g. EDP, EDT, EDC) - Auto generated from name if left blank",
          technicalGroupTitle: "Technical details",
          minOilLabel: "Minimum oil concentration (%)",
          minOilDescription: "Minimum oil percentage (0-100%)",
          maxOilLabel: "Maximum oil concentration (%)",
          maxOilDescription: "Maximum oil percentage (0-100%)",
          longevityLabel: "Longevity (hours)",
          longevityDescription:
            "Average longevity range (e.g. 6-8 hours) for display",
          intensityLabel: "Intensity",
          intensityDescription:
            "Suggested intensity level (soft, moderate, strong) for customers",
          displayOrderLabel: "Display order",
          displayOrderDescription:
            "Order number to sort this concentration in lists",
          statusLabel: "Status",
          createConcentrationSuccess: "Concentration created successfully!",
          updateConcentrationSuccess: "Concentration updated successfully!",
        },
        common: {
          save: "Save",
          cancel: "Cancel",
          close: "Close",
          loading: "Processing...",
          submitting: "Submitting...",
        },
      },
    },
  },
};
