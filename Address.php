<?php
class UserAddress
{
    private $pdo;

    //DB接続情報
    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    // 住所登録
    public function create(array $data): bool
    {
        $sql = "INSERT INTO user_addresses (user_id, postal_code, prefecture, city_town, building, created_at)
                VALUES (:user_id, :postal_code, :prefecture, :city_town, :building, NOW())";

        try {
            $stmt = $this->pdo->prepare($sql);
            $result = $stmt->execute([
                ':user_id'     => $data['user_id'],
                ':postal_code' => $data['postal_code'],
                ':prefecture'    => $data['prefecture'],
                ':city_town'    => $data['city_town'],
                ':building'    => $data['building'],
            ]);

            // Logger::logSQL($sql, $data);
            return $result;
        } catch (PDOException $e) {
            // Logger::logSQLError($e->getMessage(), $sql);
            return false;
        }
    }

    // ユーザーIDから住所取得
    public function findByUserId(int $userId): ?array
    {
        $sql = "SELECT * FROM addresses WHERE user_id = :user_id LIMIT 1";

        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([':user_id' => $userId]);
            $address = $stmt->fetch(PDO::FETCH_ASSOC);
            return $address ?: null;
        } catch (PDOException $e) {
            // Logger::logSQLError($e->getMessage(), $sql);
            return null;
        }
    }

    // ユーザーIDで住所更新
    public function updateByUserId(array $data): bool
    {
        $sql = "UPDATE user_addresses
                SET postal_code = :postal_code,
                    prefecture = :prefecture,
                    city_town = :city_town,
                    building = :building,
                    created_at = NOW()
                WHERE user_id = :user_id";

        try {
            $stmt = $this->pdo->prepare($sql);
            $params = [
                ':postal_code' => $data['postal_code'],
                ':prefecture'    => $data['prefecture'],
                ':city_town'    => $data['city_town'],
                ':building'    => $data['building'],
                ':user_id'     => $data['user_id']
            ];
            $result = $stmt->execute($params);

            // Logger::logSQL($sql, $params);
            return $result;
        } catch (PDOException $e) {
            // Logger::logSQLError($e->getMessage(), $sql);
            return false;
        }
    }

    /**
     * 郵便番号・都道府県・市区町村の組み合わせがマスタに存在するかを返す
     *
     * @param string $postal_code       郵便番号（XXX-XXXX 形式）
     * @param string $prefecture 都道府県
     * @param string $city      市区町村・番地
     * @return bool             存在すれば true、そうでなければ false
     */
    public function checkAddressMatch(string $postal_code, string $prefecture, string $input_city_town): bool
    {
        // 正規化
        $postal_code = mb_convert_kana(str_replace('-', '', trim($postal_code)), 'n');
        $input_city_town = $this->normalizeAddress($input_city_town);

        $sql = "
        SELECT city, town
        FROM address_master
        WHERE postal_code = :postal_code
        AND prefecture = :prefecture
    ";

        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->bindParam(':postal_code', $postal_code, PDO::PARAM_STR);
            $stmt->bindParam(':prefecture', $prefecture, PDO::PARAM_STR);
            $stmt->execute();

            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($results as $row) {
                $town = $row['town'];
                $city = $row['city'];

                if ($town === '以下に掲載がない場合' || is_null($town)) {
                    continue; // スキップ
                }

                // 入力値とマスタを正規化
                $input = $this->normalizeAddress($input_city_town); // 入力全体
                $master_town = $this->normalizeAddress($town);      // townだけ
                $master_city = $this->normalizeAddress($city);

                // 入力がマスタの city を含んでいなければ除外（札幌市中央区 など）
                if (mb_strpos($input, $master_city . $master_town) === false) continue;
                // 「入力値にマスタのtownが含まれている」もしくはその逆で一致を判定
                if (mb_strpos($input, $master_city . $master_town) !== false || mb_strpos($master_city . $master_town, $input) !== false) {
                    return true; // 一致
                }
            }

            return false; // 全て不一致だった
        } catch (PDOException $e) {
            // ログ出力など
            return false;
        }
    }

    // 住所の正規化
    private function normalizeAddress(string $str): string
    {
        $str = mb_convert_kana($str, 'n'); // 全角数字→半角
        $str = preg_replace('/[　\s]/u', '', $str); // スペース除去
        $str = str_replace(['ー', '―', '－'], '-', $str); // ハイフン統一
        $str = preg_replace('/（.*?）/u', '', $str); // 全角カッコの中身を削除（例：丁目の範囲）
        $str = str_replace(
            ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'],
            ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
            $str
        );
        return $str;
    }
}
