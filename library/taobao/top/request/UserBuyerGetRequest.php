<?php
/**
 * TOP API: taobao.user.buyer.get request
 * 
 * @author auto create
 * @since 1.0, 2012-10-22 16:47:33
 */
class UserBuyerGetRequest
{
	/** 
	 * 只返回user_id,nick,sex,buyer_credit,avatar,has_shop,vip_info参数
	 **/
	private $fields;
	
	private $apiParas = array();
	
	public function setFields($fields)
	{
		$this->fields = $fields;
		$this->apiParas["fields"] = $fields;
	}

	public function getFields()
	{
		return $this->fields;
	}

	public function getApiMethodName()
	{
		return "taobao.user.buyer.get";
	}
	
	public function getApiParas()
	{
		return $this->apiParas;
	}
	
	public function check()
	{
		
		RequestCheckUtil::checkNotNull($this->fields,"fields");
	}
	
	public function putOtherTextParam($key, $value) {
		$this->apiParas[$key] = $value;
		$this->$key = $value;
	}
}
