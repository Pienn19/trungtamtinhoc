const sql = require('mssql');
(async () => {
    try {
        await sql.connect('workstation id=TrungTamTinHoc.mssql.somee.com;packet size=4096;user id=HuuThinh_SQLLogin_1;pwd=oax1dty96m;data source=TrungTamTinHoc.mssql.somee.com;persist security info=False;initial catalog=TrungTamTinHoc;TrustServerCertificate=True;');
        const result = await sql.query(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'KETQUAHOCTAP'`);
        console.dir(result.recordset);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
