from connect import connection

cur = connection.cursor()

addresses = {
    "Sóc Trăng": {
        "Châu Thành": ["Hồ Đắc Kiện", "Thuận Hòa", "Thị trấn Châu Thành"],
        "Kế Sách": ["Thị trấn An Lạc Thôn", "Đại Hải"]
    },
    "Cần Thơ": {
        "Ninh Kiều": ["Xuân Khánh", "Hưng Lợi"],
        "Bình Thủy": ["Trà Nóc", "Thuận An"]
    }
}

try:
    for province in addresses:
        for district in addresses[province]:
            for commune in addresses[province][district]:
                #print(province, district, commune)
                cur.execute("""
                    INSERT INTO parcelpoint.public.address VALUES
                    (gen_random_uuid(), %s, %s, %s)
                """, (province, district, commune))
    connection.commit()
    print('finished!')
except Exception as e:
    print(e)
    connection.rollback()