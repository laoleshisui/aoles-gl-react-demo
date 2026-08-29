import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Empty, Modal, Spin, Tag, Typography } from 'antd';

interface Goods {
  goods_id: string;
  name: string;
  description?: string;
  payable_amount?: string | number;
  credits_count?: number;
  type?: string;
  subscription_plan?: { name?: string; duration_days?: number } | null;
}

interface PaymentPanelProps {
  open: boolean;
  dataServerBaseUrl: string;
  accessToken: string;
  authorizationScheme: 'Bearer' | 'Api-Key';
  onClose: () => void;
}

export default function PaymentPanel({ open, dataServerBaseUrl, accessToken, authorizationScheme, onClose }: PaymentPanelProps) {
  const [goods, setGoods] = useState<Goods[]>([]);
  const [selectedGoodsId, setSelectedGoodsId] = useState('');
  const [loadingGoods, setLoadingGoods] = useState(false);
  const [creatingPayment, setCreatingPayment] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [verifyMessage, setVerifyMessage] = useState('');
  const [verifyState, setVerifyState] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [mode, setMode] = useState<'shop' | 'result'>(window.location.pathname.includes('/payment/result') ? 'result' : 'shop');
  const [orderId, setOrderId] = useState(() => {
    const url = new URL(window.location.href);
    return url.searchParams.get('out_trade_no') || url.searchParams.get('order_id') || '';
  });

  const selectedGoods = useMemo(() => goods.find(item => item.goods_id === selectedGoodsId), [goods, selectedGoodsId]);
  const authHeaders = useMemo(() => accessToken ? { Authorization: `${authorizationScheme} ${accessToken}` } : {}, [accessToken, authorizationScheme]);

  async function requestJson(path: string, init: RequestInit = {}) {
    if (!dataServerBaseUrl) throw new Error('未配置数据服务地址');
    const response = await fetch(`${dataServerBaseUrl}${path}`, {
      ...init,
      headers: { ...authHeaders, ...(init.headers ?? {}) },
    });
    const payload = await response.json().catch(() => ({})) as Record<string, any>;
    if (!response.ok) throw new Error(payload.error || payload.detail || payload.message || `请求失败（${response.status}）`);
    return payload;
  }

  async function loadGoods() {
    if (!dataServerBaseUrl) return;
    setLoadingGoods(true);
    setErrorMessage('');
    try {
      const payload = await requestJson('/credits/goods_detail/');
      const list = Array.isArray(payload) ? payload : payload.results || payload.data || [];
      setGoods(list);
      if (!selectedGoodsId && list.length) setSelectedGoodsId(list[0].goods_id);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '商品加载失败');
    } finally {
      setLoadingGoods(false);
    }
  }

  function openCheckout(response: unknown) {
    const checkout = String(response ?? '').trim();
    if (!checkout) throw new Error('支付宝未返回收银台地址');
    if (/^https?:\/\//i.test(checkout)) {
      window.location.assign(checkout);
      return;
    }
    document.open();
    document.write(checkout);
    document.close();
  }

  async function createPayment() {
    if (!accessToken) {
      setErrorMessage('请先登录后再购买');
      return;
    }
    if (!selectedGoods) {
      setErrorMessage('请选择商品');
      return;
    }
    setCreatingPayment(true);
    setErrorMessage('');
    try {
      const payload = await requestJson('/credits/payments/alipay/create/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goods_id: selectedGoods.goods_id, http_method: 'GET' }),
      });
      openCheckout(payload.response);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '创建支付订单失败');
    } finally {
      setCreatingPayment(false);
    }
  }

  async function verifyPayment() {
    if (!orderId) {
      setVerifyState('error');
      setVerifyMessage('缺少订单号，无法确认支付结果');
      return;
    }
    if (!accessToken) {
      setVerifyState('error');
      setVerifyMessage('登录状态已失效，请重新登录后在订单中心确认');
      return;
    }
    setVerifyingPayment(true);
    setVerifyState('pending');
    setVerifyMessage('正在等待支付宝异步通知...');
    try {
      let lastError = '支付尚未完成';
      for (let attempt = 0; attempt < 6; attempt += 1) {
        try {
          const payload = await requestJson('/credits/payments/alipay/verify/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_id: orderId }),
          });
          setVerifyState('success');
          setVerifyMessage(payload.message || '支付成功，权益已到账');
          return;
        } catch (error) {
          lastError = error instanceof Error ? error.message : '支付尚未完成';
          if (attempt < 5) await new Promise(resolve => window.setTimeout(resolve, 2000));
        }
      }
      setVerifyState('error');
      setVerifyMessage(`${lastError}，请稍后重试确认`);
    } finally {
      setVerifyingPayment(false);
    }
  }

  useEffect(() => {
    if (open && mode === 'shop' && !goods.length) void loadGoods();
  }, [open, mode]);

  useEffect(() => {
    if (!window.location.pathname.includes('/payment/result')) return;
    setMode('result');
    const url = new URL(window.location.href);
    setOrderId(url.searchParams.get('out_trade_no') || url.searchParams.get('order_id') || '');
    void verifyPayment();
  }, []);

  const resultTitle = verifyState === 'success' ? '支付成功' : verifyState === 'pending' ? '确认支付中' : '支付结果待确认';
  return (
    <Modal
      open={open}
      title={mode === 'result' ? '支付结果' : '购买服务'}
      width={720}
      footer={null}
      destroyOnHidden
      onCancel={onClose}
    >
      {mode === 'result' ? (
        <div className={`payment-result is-${verifyState}`}>
          <div className="payment-result__icon">{verifyState === 'success' ? '✓' : verifyState === 'pending' ? '…' : '!'}</div>
          <Typography.Title level={4}>{resultTitle}</Typography.Title>
          <Typography.Paragraph>{verifyMessage}</Typography.Paragraph>
          {orderId && <Typography.Text type="secondary">订单号：{orderId}</Typography.Text>}
          <Button type="primary" loading={verifyingPayment} onClick={() => { void verifyPayment(); }}>重新确认</Button>
        </div>
      ) : (
        <div className="payment-panel">
          <div className="payment-intro">
            <div><Typography.Title level={4}>选择套餐</Typography.Title><Typography.Text type="secondary">支付宝支付完成后，积分或会员权益会自动到账。</Typography.Text></div>
            <Tag color="green">支付宝 · RSA2</Tag>
          </div>
          {!accessToken && <Alert type="info" showIcon message="请先登录" description="登录后才能创建支付订单。" />}
          {errorMessage && <Alert type="error" showIcon message={errorMessage} />}
          {loadingGoods ? <div className="payment-loading"><Spin tip="正在加载商品..." /></div> : goods.length ? (
            <div className="goods-grid" role="radiogroup" aria-label="商品套餐">
              {goods.map(item => (
                <button key={item.goods_id} type="button" className={`goods-option ${selectedGoodsId === item.goods_id ? 'is-selected' : ''}`} onClick={() => setSelectedGoodsId(item.goods_id)} role="radio" aria-checked={selectedGoodsId === item.goods_id}>
                  <span className="goods-option__top"><strong>{item.name}</strong><b>￥{Number(item.payable_amount ?? 0).toFixed(2)}</b></span>
                  <span className="goods-option__description">{item.description || '服务套餐'}</span>
                  <span className="goods-option__meta">{item.type === 'membership' ? (item.subscription_plan?.name || '会员套餐') : `${item.credits_count ?? 0} 积分`}</span>
                </button>
              ))}
            </div>
          ) : <Empty description="暂无可购买商品" />}
          {selectedGoods && <div className="payment-summary"><div><span>应付金额</span><strong>￥{Number(selectedGoods.payable_amount ?? 0).toFixed(2)}</strong></div><Button type="primary" loading={creatingPayment} disabled={!accessToken} onClick={() => { void createPayment(); }}>使用支付宝支付</Button></div>}
        </div>
      )}
    </Modal>
  );
}
